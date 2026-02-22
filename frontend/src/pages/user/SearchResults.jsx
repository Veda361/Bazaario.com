import React from "react";
import { useLocation, Link } from "react-router-dom";
import { allProducts } from "./Products";

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") || "";

  const filteredProducts = allProducts.filter((product) =>
    product.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h2 className="text-3xl font-bold mb-8">
        Search Results for "{query}"
      </h2>

      {filteredProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="bg-white p-5 rounded-xl shadow hover:shadow-xl"
            >
              <img
                src={product.image}
                alt={product.title}
                className="h-40 object-contain mb-3"
              />
              <h3 className="font-semibold">{product.title}</h3>
              <p className="text-gray-600">
                ₹{product.price.toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;