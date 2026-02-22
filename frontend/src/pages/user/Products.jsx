import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { useCart } from "../../context/CartContext";

/* 🔥 EXPORT PRODUCTS FOR PRODUCT DETAIL PAGE */
export const allProducts = [
  {
    id: 1,
    category: "Electronics",
    sub: "Laptops",
    title: "Apple MacBook Pro M3",
    description: "Powerful performance laptop with M3 chip and Retina display.",
    price: 189999,
    oldPrice: 209999,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
  },
  {
    id: 2,
    category: "Electronics",
    sub: "Headphones",
    title: "Sony WH-1000XM5",
    description: "Industry-leading noise cancelling headphones.",
    price: 29999,
    oldPrice: 34999,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1580894908361-967195033215?w=800",
  },
  {
    id: 101,
    category: "Mobiles",
    sub: "OnePlus",
    title: "OnePlus 12 5G",
    description: "Snapdragon 8 Gen 3 powered flagship.",
    price: 64999,
    oldPrice: 69999,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
  },
  {
    id: 102,
    category: "Mobiles",
    sub: "iPhone",
    title: "iPhone 15 Pro Max",
    description: "Titanium design with A17 Pro chip.",
    price: 159999,
    oldPrice: 169999,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
  },
  {
    id: 103,
    category: "Mobiles",
    sub: "Samsung",
    title: "Samsung Galaxy S24 Ultra",
    description: "200MP camera & S-Pen flagship.",
    price: 124999,
    oldPrice: 139999,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800",
  },
  {
    id: 201,
    category: "Fashion",
    sub: "Men",
    title: "Men Slim Fit Shirt",
    description: "Premium cotton shirt.",
    price: 1499,
    oldPrice: 2499,
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
  },
  {
    id: 202,
    category: "Fashion",
    sub: "Women",
    title: "Women Floral Dress",
    description: "Elegant summer dress.",
    price: 2199,
    oldPrice: 3499,
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1520975922321-6b1a3e1c3f8a?w=800",
  },
  {
    id: 203,
    category: "Fashion",
    sub: "Kids",
    title: "Kids Hoodie",
    description: "Warm fleece hoodie.",
    price: 1299,
    oldPrice: 1999,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800",
  },
  {
    id: 204,
    category: "Fashion",
    sub: "Footwear",
    title: "Nike Running Shoes",
    description: "Comfortable sports shoes.",
    price: 4999,
    oldPrice: 6999,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
  },
];
const Products = () => {
  const { category, subcategory } = useParams();
  const [sortOption, setSortOption] = useState("");
  const { addToCart } = useCart();

  const filteredProducts = allProducts.filter(
    (product) =>
      product.category === category &&
      product.sub === subcategory
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "low") return a.price - b.price;
    if (sortOption === "high") return b.price - a.price;
    if (sortOption === "rating") return b.rating - a.rating;
    return 0;
  });

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) stars.push(<FaStar key={i} />);
      else if (rating >= i - 0.5) stars.push(<FaStarHalfAlt key={i} />);
      else stars.push(<FaRegStar key={i} />);
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">
          {category} / {subcategory}
        </h2>

        <select
          onChange={(e) => setSortOption(e.target.value)}
          className="border px-4 py-2 rounded-lg"
        >
          <option value="">Sort By</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {sortedProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {sortedProducts.map((product) => {
            const discount = Math.round(
              ((product.oldPrice - product.price) / product.oldPrice) * 100
            );

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow hover:shadow-2xl transition duration-300 p-5 flex flex-col"
              >
                {/* 🔥 CLICKABLE PRODUCT */}
                <Link to={`/product/${product.id}`}>
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-48 object-contain mb-4"
                  />

                  <h3 className="font-semibold text-gray-800 mb-1 hover:text-blue-600 transition">
                    {product.title}
                  </h3>
                </Link>

                <p className="text-sm text-gray-500 mb-2">
                  {product.description}
                </p>

                <div className="flex items-center text-yellow-500 mb-2 gap-1">
                  {renderStars(product.rating)}
                  <span className="text-sm text-gray-600 ml-2">
                    {product.rating}
                  </span>
                </div>

                <div className="mb-4">
                  <span className="text-lg font-bold text-gray-900">
                    ₹{product.price.toLocaleString()}
                  </span>{" "}
                  <span className="text-sm text-gray-400 line-through">
                    ₹{product.oldPrice.toLocaleString()}
                  </span>{" "}
                  <span className="text-sm text-green-600 font-semibold">
                    {discount}% OFF
                  </span>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  className="mt-auto bg-gray-900 text-white py-2 rounded-lg hover:bg-yellow-400 hover:text-black transition"
                >
                  Add to Cart
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Products;