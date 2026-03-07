import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const RelatedProducts = ({ category, currentProductId }) => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const data = await apiRequest(`/products/?category=${category}&limit=10`);

        const filtered =
          data.items?.filter((p) => p.id !== currentProductId) || [];

        setProducts(filtered);

      } catch (err) {
        console.error(err);
        toast.error("Failed to load related products ❌");
      }
    };

    if (category) fetchRelated();
  }, [category, currentProductId]);

  if (!products.length) return null;

  return (
    <div className="mt-24">
      <h2 className="text-3xl font-bold mb-10">Related Products</h2>

      <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide">

        {products.map((p) => (
          <div
            key={p.id}
            onClick={() => {
              navigate(`/product/${p.id}`);
              toast.info("Opening product 🔎");
            }}
            className="min-w-[240px] border-4 border-white bg-netflixDark p-4
                       shadow-[8px_8px_0px_#E50914]
                       hover:-translate-x-1 hover:-translate-y-1
                       hover:shadow-[12px_12px_0px_#E50914]
                       transition cursor-pointer"
          >

            <div className="border-b-2 border-white pb-3 mb-3">
              <h3 className="font-black text-xs uppercase line-clamp-2">
                {p.title}
              </h3>
            </div>

            <div className="flex justify-center mb-3">
              <img
                src={p.image_url}
                alt={p.title}
                className="h-28 object-contain"
              />
            </div>

            <p className="text-lg font-bold text-netflixRed">
              ₹{p.price}
            </p>

          </div>
        ))}

      </div>
    </div>
  );
};

export default RelatedProducts;