import React, { useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:8000/products/");
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="flex">
      <div className="flex-1 max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-8">🔥 Latest Products</h2>

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow hover:shadow-2xl transition duration-300 p-5 flex flex-col"
              >
                <h3 className="font-semibold text-gray-800 mb-2">
                  {product.title}
                </h3>

                <p className="text-gray-500 text-sm mb-2">
                  {product.description}
                </p>

                <div className="mb-4">
                  <span className="text-lg font-bold text-gray-900">
                    ₹{product.price}
                  </span>
                </div>

                <button className="mt-auto bg-gray-900 text-white py-2 rounded-lg hover:bg-yellow-400 hover:text-black transition flex items-center justify-center gap-2">
                  <FaShoppingCart />
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;