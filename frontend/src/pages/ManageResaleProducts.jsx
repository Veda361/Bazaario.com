import { useEffect, useState } from "react";
import { apiRequest } from "../api";

const ManageResaleProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchResale();
  }, []);

  const fetchResale = async () => {
    const data = await apiRequest("/admin/resale-products");
    setProducts(data || []);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">
        ♻️ Manage Resale Products
      </h1>

      <div className="bg-white rounded-xl shadow-md p-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="border-b py-4 flex justify-between"
          >
            <div>
              <p className="font-semibold">{p.title}</p>
              <p className="text-sm text-gray-500">
                Condition: {p.condition}
              </p>
              <p className="text-yellow-600 font-bold">
                ₹ {p.admin_price}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded text-sm ${
                p.status === "Sold"
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
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