import { useEffect, useState } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { apiRequest } from "../api";
import PageWrapper from "../components/PageWrapper";

const Products = () => {
  const { category, subcategory } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [compareList, setCompareList] = useState([]);

  const sort_by = searchParams.get("sort_by") || "id";
  const order = searchParams.get("order") || "desc";
  const min_price = searchParams.get("min_price") || "";
  const max_price = searchParams.get("max_price") || "";
  const in_stock = searchParams.get("in_stock") || "";
  const limit = 9;

  // 🔥 FETCH PRODUCTS (APPEND FOR INFINITE SCROLL)
  const fetchProducts = async (pageNumber = 1) => {
    setLoading(true);
    try {
      let url = `/products/?category=${category}&subcategory=${subcategory}&page=${pageNumber}&limit=${limit}&sort_by=${sort_by}&order=${order}`;

      if (min_price) url += `&min_price=${min_price}`;
      if (max_price) url += `&max_price=${max_price}`;
      if (in_stock) url += `&in_stock=true`;

      const data = await apiRequest(url);

      if (pageNumber === 1) {
        setProducts(data.items || []);
      } else {
        setProducts((prev) => [...prev, ...(data.items || [])]);
      }

      if (!data.items || data.items.length < limit) {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // 🔥 RESET WHEN CATEGORY CHANGES
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchProducts(1);
  }, [category, subcategory, searchParams]);

  // 🔥 INFINITE SCROLL
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        !loading &&
        hasMore
      ) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, loading, hasMore]);

  // 🔥 COMPARE TOGGLE
  const toggleCompare = (product) => {
    setCompareList((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 3) return prev; // max 3 compare
      return [...prev, product];
    });
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10">

        {/* CATEGORY HEADER */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-8 rounded-xl mb-8 shadow">
          <h1 className="text-3xl font-bold">
            {subcategory} in {category}
          </h1>
        </div>

        {/* PRODUCTS GRID */}
        <div className="grid md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-2xl hover:-translate-y-1 transform transition duration-300 relative"
            >
              <img
                src={product.image_url}
                alt={product.title}
                className="h-40 object-contain mb-3"
              />

              <h3 className="font-semibold dark:text-white line-clamp-2">
                {product.title}
              </h3>

              <p className="text-yellow-500 text-sm mt-1">
                ⭐⭐⭐⭐☆
              </p>

              <p className="text-lg font-bold mt-2 dark:text-yellow-400">
                ₹{product.price}
              </p>

              {/* QUICK VIEW */}
              <button
                onClick={() => setQuickViewProduct(product)}
                className="mt-3 w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
              >
                Quick View
              </button>

              {/* COMPARE */}
              <label className="flex items-center gap-2 mt-3 text-sm dark:text-white">
                <input
                  type="checkbox"
                  checked={
                    compareList.find((p) => p.id === product.id)
                      ? true
                      : false
                  }
                  onChange={() => toggleCompare(product)}
                />
                Compare
              </label>
            </div>
          ))}
        </div>

        {loading && (
          <p className="text-center mt-6 dark:text-gray-400">
            Loading more products...
          </p>
        )}

        {/* QUICK VIEW MODAL */}
        {quickViewProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-10 rounded-xl w-2/3 relative">
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-3 right-3 text-xl"
              >
                ✕
              </button>

              <h2 className="text-2xl font-bold dark:text-white">
                {quickViewProduct.title}
              </h2>

              <img
                src={quickViewProduct.image_url}
                className="h-60 object-contain my-4"
              />

              <p className="dark:text-gray-300">
                {quickViewProduct.description}
              </p>

              <p className="text-xl font-bold mt-4 dark:text-yellow-400">
                ₹{quickViewProduct.price}
              </p>
            </div>
          </div>
        )}

        {/* COMPARE PANEL */}
        {compareList.length > 0 && (
          <div className="fixed bottom-6 right-6 bg-yellow-400 p-4 rounded-xl shadow-xl">
            <button
              onClick={() =>
                navigate("/compare", { state: compareList })
              }
              className="font-semibold"
            >
              Compare ({compareList.length})
            </button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Products;