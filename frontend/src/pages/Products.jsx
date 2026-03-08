import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import PageWrapper from "../components/PageWrapper";

const Products = () => {
  const { category, subcategory } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const sort_by = searchParams.get("sort_by") || "id";
  const order = searchParams.get("order") || "desc";
  const min_price = searchParams.get("min_price") || "";
  const max_price = searchParams.get("max_price") || "";
  const in_stock = searchParams.get("in_stock") || "";
  const limit = 9;

  const fetchProducts = useCallback(async () => {
    setLoading(true);

    try {
      let url = `/products?category=${category}&subcategory=${subcategory}&limit=${limit}&sort_by=${sort_by}&order=${order}`;
      if (min_price) url += `&min_price=${min_price}`;
      if (max_price) url += `&max_price=${max_price}`;
      if (in_stock) url += `&in_stock=true`;

      const data = await apiRequest(url);
      setProducts(data.items || []);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }, [category, subcategory, sort_by, order, min_price, max_price, in_stock]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // restore scroll
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("productsScroll");
    if (savedScroll) {
      window.scrollTo(0, parseInt(savedScroll));
    }
  }, []);

  const handleNavigate = (id) => {
    sessionStorage.setItem("productsScroll", window.scrollY);
    navigate(`/product/${id}`);
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-netflixBlack px-10 py-14 text-white">
        <div className="border-4 border-white bg-netflixDark p-8 mb-14 shadow-[12px_12px_0px_#E50914]">
          <h1 className="text-4xl font-black uppercase">
            {subcategory} in {category}
          </h1>
        </div>

        <div className="flex flex-wrap gap-12 justify-center">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="relative w-[300px] border-4 border-white bg-netflixDark p-6 shadow-[10px_10px_0px_#E50914] transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[14px_14px_0px_#E50914] active:translate-x-2 active:translate-y-2 active:shadow-none group"
            >
              {index < 3 && (
                <div className="absolute -top-3 -right-10 rotate-45 bg-netflixRed text-white text-xs font-black px-12 py-1">
                  HOT
                </div>
              )}

              <div className="border-b-2 border-white pb-4 mb-4">
                <h3 className="font-black uppercase text-sm line-clamp-2">
                  {product.title}
                </h3>
              </div>

              <div className="flex justify-center items-center mb-4 border-b-2 border-white pb-4">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="h-40 object-contain transition group-hover:scale-110"
                />
              </div>

              <p className="text-2xl font-extrabold text-netflixRed mb-6">
                ₹{product.price}
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => setQuickViewProduct(product)}
                  className="w-full py-3 uppercase font-bold border-4 border-white bg-netflixRed shadow-[6px_6px_0px_#000] hover:bg-red-700 active:translate-x-2 active:translate-y-2 active:shadow-none"
                >
                  Quick View
                </button>

                <button
                  onClick={() => handleNavigate(product.id)}
                  className="w-full py-3 uppercase font-bold border-4 border-white bg-black shadow-[6px_6px_0px_#000] hover:bg-gray-900 active:translate-x-2 active:translate-y-2 active:shadow-none"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Products;
