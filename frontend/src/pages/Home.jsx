import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import PageWrapper from "../components/PageWrapper";
import SkeletonCard from "../components/SkeletonCard";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const category = queryParams.get("category");
  const subcategory = queryParams.get("subcategory");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = "/products/?page=1&limit=20";
      if (category) url += `&category=${category}`;
      if (subcategory) url += `&subcategory=${subcategory}`;

      const data = await apiRequest(url);
      setProducts(data.items || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [location.search]);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 transition-all duration-500 ease-in-out">

        {/* HERO */}
        <div className="mb-10 rounded-2xl overflow-hidden bg-gradient-to-r from-black to-gray-800 text-white p-12 shadow-xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to Bazaario
          </h1>
          <p className="text-lg mb-6 text-gray-200">
            Discover unbeatable deals. Shop smarter. Live better.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition"
          >
            Shop Now
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-8 dark:text-white">
          Products
        </h1>

        {/* 🔥 LOADING SKELETON */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transform transition duration-300 group border"
              >
                <div className="relative h-52 bg-gray-50 dark:bg-gray-700 flex items-center justify-center overflow-hidden rounded-t-xl">
                  
                  <div className="absolute top-3 left-3 flex gap-2">
                    {product.stock < 5 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Limited
                      </span>
                    )}
                    {product.price < 1000 && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Best Deal
                      </span>
                    )}
                  </div>

                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="h-44 object-contain group-hover:scale-105 transition duration-300"
                    />
                  )}
                </div>

                <div className="p-4">
                  <h2 className="text-sm font-semibold dark:text-white line-clamp-2">
                    {product.title}
                  </h2>

                  <p className="text-yellow-500 text-sm mt-1">
                    ⭐⭐⭐⭐☆
                  </p>

                  <p className="text-lg font-bold mt-2 dark:text-yellow-400">
                    ₹{product.price.toLocaleString()}
                  </p>

                  <button
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="mt-3 w-full bg-yellow-400 text-black py-2 rounded-lg hover:bg-yellow-500 transition"
                  >
                    View Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </PageWrapper>
  );
};

export default Home;