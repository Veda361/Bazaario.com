import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { apiRequest } from "../api";

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q");

  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await apiRequest(`/products/?search=${query}`);
        setResults(data.items || []);
      } catch (err) {
        console.error(err);
      }
    };

    if (query) fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h2 className="text-3xl font-bold mb-8">
        Search Results for "{query}"
      </h2>

      {results.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid md:grid-cols-4 gap-6">
          {results.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="bg-white p-5 rounded-xl shadow hover:shadow-xl"
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="h-40 object-contain mb-3"
                />
              )}
              <h3 className="font-semibold">{product.title}</h3>
              <p className="text-gray-600">₹{product.price}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;