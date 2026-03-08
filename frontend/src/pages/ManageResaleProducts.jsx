import { useEffect, useState } from "react";
import { apiRequest } from "../api";

const ManageResaleProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchResale();
  }, []);

  const fetchResale = async () => {
    const data = await apiRequest("/products/admin/resale-products");
    setProducts(data || []);
  };

  return (
    <div className="min-h-screen bg-netflixBlack text-white p-10">

      <h1 className="text-4xl font-bold mb-8">
        ♻️ Manage Resale Products
      </h1>

      <div className="bg-netflixDark border border-white/10">

        {products.map((p) => (
          <div
            key={p.id}
            className="flex justify-between border-b border-white/10 p-5"
          >

            <div>
              <p className="font-bold">{p.title}</p>

              <p className="text-gray-400 text-sm">
                Condition: {p.condition}
              </p>

              <p className="text-netflixRed font-bold">
                ₹{p.admin_price}
              </p>
            </div>

            <span
              className={`px-3 py-1 ${
                p.status === "Sold"
                  ? "bg-red-600"
                  : "bg-green-600"
              }`}
            >
              {p.status}
            </span>

          </div>
        ))}

      </div>
    </div>
  );
};

export default ManageResaleProducts;