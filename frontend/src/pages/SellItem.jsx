import { useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import { toast } from "react-toastify";

const SellItem = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    expected_price: "",
    condition: "Good",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await auth.currentUser.getIdToken();

      const form = new FormData();

      Object.keys(formData).forEach((key) => form.append(key, formData[key]));

      if (image) {
        form.append("image", image);
      }

      const res = await fetch("https://bazaario-com.onrender.com/api/resale/sell", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!res.ok) {
        toast.error("Submission failed");
        return;
      }

      toast.success("Sell request submitted successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    }

    setLoading(false);
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-netflixBlack flex justify-center items-start pt-32 px-6">
        <div
          className="w-full max-w-3xl border-4 border-white
          bg-netflixDark p-10
          shadow-[20px_20px_0px_#E50914]
          transition-all duration-300
          hover:translate-x-1 hover:translate-y-1
          hover:shadow-[28px_28px_0px_#E50914]"
        >
          <h2 className="text-4xl font-black uppercase mb-8 border-b-4 border-white pb-4">
            Sell Your Product
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              name="title"
              placeholder="Product Title"
              required
              onChange={handleChange}
              className="w-full p-4 bg-black border-4 border-white
              text-white placeholder-gray-400
              focus:outline-none focus:border-netflixRed"
            />

            <textarea
              name="description"
              placeholder="Product Description"
              required
              rows="4"
              onChange={handleChange}
              className="w-full p-4 bg-black border-4 border-white
              text-white placeholder-gray-400
              focus:outline-none focus:border-netflixRed"
            />

            <div className="grid md:grid-cols-2 gap-6">
              <input
                name="category"
                placeholder="Category"
                required
                onChange={handleChange}
                className="p-4 bg-black border-4 border-white
                text-white placeholder-gray-400
                focus:outline-none focus:border-netflixRed"
              />

              <input
                name="subcategory"
                placeholder="Subcategory"
                onChange={handleChange}
                className="p-4 bg-black border-4 border-white
                text-white placeholder-gray-400
                focus:outline-none focus:border-netflixRed"
              />
            </div>

            <input
              type="number"
              name="expected_price"
              placeholder="Expected Price"
              required
              onChange={handleChange}
              className="w-full p-4 bg-black border-4 border-white
              text-white placeholder-gray-400
              focus:outline-none focus:border-netflixRed"
            />

            <select
              name="condition"
              onChange={handleChange}
              className="w-full p-4 bg-black border-4 border-white text-white
              focus:outline-none focus:border-netflixRed"
            >
              <option>Like New</option>
              <option>Good</option>
              <option>Fair</option>
            </select>

            <div className="border-4 border-dashed border-white p-6 text-center">
              <p className="text-gray-400 mb-2">Upload Product Image</p>

              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                className="text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 uppercase font-black border-4 border-white
              shadow-[8px_8px_0px_#000] transition-all duration-200
              ${
                loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-netflixRed hover:bg-red-700 active:translate-x-2 active:translate-y-2 active:shadow-none"
              }`}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
};

export default SellItem;
