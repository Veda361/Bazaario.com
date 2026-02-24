import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { apiRequest } from "../api";
import { useWishlist } from "../context/WishlistContext";
import PageWrapper from "../components/PageWrapper";
const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await apiRequest(`/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error("Failed to load product", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const isWishlisted = wishlist.find((item) => item.id === product?.id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg font-semibold dark:text-white">
          Loading product...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg font-semibold text-red-500">
          Product not found
        </p>
      </div>
    );
  }

  return (
    <PageWrapper>
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10 transition-all duration-500 ease-in-out">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-10 grid md:grid-cols-2 gap-10 hover:shadow-2xl transition duration-300">

        {/* IMAGE SECTION */}
        <div className="flex justify-center items-center">
          <img
            src={product.image_url}
            alt={product.title}
            className="h-96 object-contain hover:scale-105 transition duration-300"
          />
        </div>

        {/* DETAILS SECTION */}
        <div>
          <h1 className="text-3xl font-bold mb-4 dark:text-white">
            {product.title}
          </h1>

          <p className="text-yellow-500 mb-3">
            ⭐⭐⭐⭐☆ 4.3 (120 reviews)
          </p>

          <p className="text-3xl font-bold text-red-600 mb-3">
            ₹{product.price.toLocaleString()}
          </p>

          {/* DELIVERY INFO */}
          <p className="text-green-600 font-semibold mb-2">
            FREE Delivery by Tomorrow
          </p>

          {/* STOCK INFO */}
          <p
            className={`text-sm mb-6 ${
              product.stock > 0
                ? "text-gray-600 dark:text-gray-300"
                : "text-red-500 font-semibold"
            }`}
          >
            {product.stock > 0
              ? `In Stock (${product.stock} available)`
              : "Out of Stock"}
          </p>

          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {product.description}
          </p>

          {/* ACTION BUTTONS */}
          <div className="flex gap-4 flex-wrap">

            <button
              disabled={product.stock === 0}
              onClick={() => addToCart(product)}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                product.stock === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-yellow-500"
              }`}
            >
              Add to Cart
            </button>

            <button
              disabled={product.stock === 0}
              onClick={() => {
                addToCart(product);
                navigate("/checkout");
              }}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition ${
                product.stock === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              Buy Now
            </button>

            {/* ❤️ Wishlist */}
            <button
              onClick={() => toggleWishlist(product)}
              className={`px-5 py-3 border rounded-lg transition ${
                isWishlisted
                  ? "bg-red-500 text-white border-red-500"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
              }`}
            >
              ❤️
            </button>

          </div>

          {/* TRUST SECTION */}
          <div className="mt-10 border-t pt-6 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ✔ Secure Payment
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ✔ 7 Days Easy Return
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ✔ 100% Authentic Products
            </p>
          </div>
        </div>
      </div>
    </div>
    </PageWrapper>
  );
};

export default ProductDetail;