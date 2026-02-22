import React from "react";
import { useParams, Link } from "react-router-dom";
import { allProducts } from "./Products";
import { useCart } from "../../context/CartContext";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const product = allProducts.find(
    (item) => item.id === parseInt(id)
  );

  if (!product) return <div className="p-10">Product not found</div>;

  const discount = Math.round(
    ((product.oldPrice - product.price) / product.oldPrice) * 100
  );

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) stars.push(<FaStar key={i} />);
      else if (rating >= i - 0.5)
        stars.push(<FaStarHalfAlt key={i} />);
      else stars.push(<FaRegStar key={i} />);
    }
    return stars;
  };

  // 🛒 Related Products (Same Category)
  const relatedProducts = allProducts.filter(
    (item) =>
      item.category === product.category &&
      item.id !== product.id
  );

  // 🔥 Frequently Bought Together (Random 2)
  const frequentlyBought = allProducts
    .filter((item) => item.id !== product.id)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-100 p-10 space-y-12">

      {/* TOP SECTION */}
      <div className="bg-white rounded-xl shadow-lg p-10 grid md:grid-cols-2 gap-10">
        <div className="flex justify-center">
          <img
            src={product.image}
            alt={product.title}
            className="max-h-96 object-contain"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">
            {product.title}
          </h1>

          <div className="flex items-center text-yellow-500 mb-4 gap-1">
            {renderStars(product.rating)}
            <span className="text-gray-600 ml-2">
              {product.rating}
            </span>
          </div>

          <div className="mb-6">
            <span className="text-3xl font-bold">
              ₹{product.price.toLocaleString()}
            </span>
            <span className="ml-3 line-through text-gray-400">
              ₹{product.oldPrice.toLocaleString()}
            </span>
            <span className="ml-3 text-green-600 font-semibold">
              {discount}% OFF
            </span>
          </div>

          <p className="text-gray-600 mb-8">
            {product.description}
          </p>

          <button
            onClick={() => addToCart(product)}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-yellow-400 hover:text-black transition"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* 📦 DELIVERY INFO */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">
          📦 Delivery Information
        </h2>
        <ul className="space-y-2 text-gray-600">
          <li>✔ Free delivery within 3–5 days</li>
          <li>✔ Cash on Delivery available</li>
          <li>✔ 7-day easy return policy</li>
          <li>✔ Secure payment & encrypted checkout</li>
        </ul>
      </div>

      {/* 🔥 FREQUENTLY BOUGHT TOGETHER */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-6">
          🔥 Frequently Bought Together
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {frequentlyBought.map((item) => (
            <div
              key={item.id}
              className="border p-4 rounded-lg"
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-32 object-contain mb-3"
              />
              <p className="font-semibold text-sm">
                {item.title}
              </p>
              <p className="text-gray-600 text-sm">
                ₹{item.price.toLocaleString()}
              </p>
              <button
                onClick={() => addToCart(item)}
                className="mt-3 w-full bg-yellow-400 py-2 rounded hover:bg-yellow-500"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 💬 REVIEWS SECTION */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-6">
          💬 Customer Reviews
        </h2>

        <div className="space-y-6">
          <div>
            <div className="flex text-yellow-500 mb-2">
              {renderStars(5)}
            </div>
            <p className="text-gray-700">
              Amazing product! Highly recommended.
            </p>
            <span className="text-sm text-gray-500">
              — Devraj S.
            </span>
          </div>

          <div>
            <div className="flex text-yellow-500 mb-2">
              {renderStars(4)}
            </div>
            <p className="text-gray-700">
              Good quality and fast delivery.
            </p>
            <span className="text-sm text-gray-500">
              — Ankit P.
            </span>
          </div>
        </div>
      </div>

      {/* 🛒 RELATED PRODUCTS */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-6">
          🛒 Related Products
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {relatedProducts.map((item) => (
            <Link
              key={item.id}
              to={`/product/${item.id}`}
              className="border p-4 rounded-lg hover:shadow-lg transition"
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-32 object-contain mb-3"
              />
              <p className="font-semibold text-sm">
                {item.title}
              </p>
              <p className="text-gray-600 text-sm">
                ₹{item.price.toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;