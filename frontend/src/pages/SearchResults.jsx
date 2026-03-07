import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { apiRequest } from "../api";
import PageWrapper from "../components/PageWrapper";
import { toast } from "react-toastify";

const SearchResults = () => {
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search).get("q");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= NORMALIZE TEXT ================= */
  const normalizeText = (text) =>
    text
      ?.toLowerCase()
      .trim()
      .replace(/[^\w\s]/gi, "");

  /* ================= HIGHLIGHT MATCH ================= */
  const highlightText = (text, keyword) => {
    if (!keyword) return text;

    const regex = new RegExp(`(${keyword})`, "gi");

    return text.replace(
      regex,
      `<span class="text-netflixRed font-bold">$1</span>`
    );
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (!queryParam) return;

      const normalizedQuery = normalizeText(queryParam);
      setQuery(normalizedQuery);

      setLoading(true);

      try {

        /* ================= SESSION CACHE ================= */
        const cached = sessionStorage.getItem(`search-${normalizedQuery}`);

        if (cached) {
          setResults(JSON.parse(cached));
          setLoading(false);
          return;
        }

        /* ================= BACKEND SEARCH ================= */
        const data = await apiRequest(`/products/?search=${normalizedQuery}`);
        let items = data.items || [];

        /* ================= FRONTEND FALLBACK SEARCH ================= */
        if (items.length === 0) {
          const fallback = await apiRequest("/products/?page=1&limit=200");

          const allProducts = fallback.items || [];

          items = allProducts.filter((product) => {
            const title = normalizeText(product.title);
            const description = normalizeText(product.description);
            const category = normalizeText(product.category);

            return (
              title.includes(normalizedQuery) ||
              description.includes(normalizedQuery) ||
              category.includes(normalizedQuery)
            );
          });
        }

        setResults(items);

        /* ================= SAVE CACHE ================= */
        sessionStorage.setItem(
          `search-${normalizedQuery}`,
          JSON.stringify(items)
        );

      } catch (err) {
        console.error(err);

        toast.error("Search failed ❌", {
          position: "bottom-right",
        });
      }

      setLoading(false);
    };

    fetchResults();
  }, [queryParam]);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-netflixBlack px-10 py-16">

        {/* ================= HEADER ================= */}
        <div className="mb-14">
          <h2 className="text-4xl font-bold">
            Search Results
          </h2>

          <p className="text-gray-400 mt-3 text-lg">
            Showing results for{" "}
            <span className="text-netflixRed font-semibold">
              "{queryParam}"
            </span>
          </p>
        </div>

        {/* ================= LOADING ================= */}
        {loading && (
          <div className="text-center py-32 text-xl">
            Searching products...
          </div>
        )}

        {/* ================= EMPTY STATE ================= */}
        {!loading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">

            <div className="bg-white/5 backdrop-blur-xl 
                            border border-white/10 
                            rounded-3xl px-12 py-16 shadow-xl">

              <h3 className="text-2xl font-semibold mb-4">
                No products found
              </h3>

              <p className="text-gray-400 mb-8">
                Try searching with different keywords.
              </p>

              <Link
                to="/"
                className="bg-netflixRed px-8 py-3 rounded-2xl 
                           hover:bg-red-700 transition shadow-glow"
              >
                Back to Home
              </Link>

            </div>
          </div>
        )}

        {/* ================= RESULTS GRID ================= */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

            {results.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group bg-netflixDark rounded-3xl p-6
                           border border-white/5
                           transition-all duration-500
                           hover:scale-105 hover:shadow-glow"
              >
                <div className="h-52 flex items-center justify-center mb-6">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="h-44 object-contain
                                 group-hover:scale-110 
                                 transition duration-500"
                    />
                  )}
                </div>

                <h3
                  className="font-semibold text-lg line-clamp-2"
                  dangerouslySetInnerHTML={{
                    __html: highlightText(product.title, query),
                  }}
                />

                <p className="text-netflixRed text-2xl font-bold mt-4">
                  ₹{product.price}
                </p>
              </Link>
            ))}

          </div>
        )}

      </div>
    </PageWrapper>
  );
};

export default SearchResults;