import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../api";

const AddProduct = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // 👈 NEW

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await apiRequest("/products/", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          price: Number(price),
          stock: Number(stock),
        }),
      });

      console.log("Product created:", data);

      // 👇 Redirect to home after success
      navigate("/");

    } catch (err) {
      alert(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Add New Product
          </h1>
          <p className="text-gray-500 mt-2">
            Create and publish a new product to your marketplace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Title
            </label>
            <input
              type="text"
              value={title}
              required
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none transition"
              placeholder="Enter product title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              required
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none transition"
              placeholder="Write product description..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹)
              </label>
              <input
                type="number"
                value={price}
                required
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none transition"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                value={stock}
                required
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none transition"
                placeholder="0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-yellow-400 hover:text-black transition duration-300 shadow-lg"
          >
            {loading ? "Creating Product..." : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;