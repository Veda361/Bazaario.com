import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

const categories = {
  Electronics: ["Laptops", "Headphones", "Cameras", "Accessories"],
  Mobiles: ["iPhone", "Samsung", "OnePlus", "Realme"],
  Fashion: ["Men", "Women", "Kids", "Footwear"],
  Furniture: ["Sofa", "Beds", "Tables", "Wardrobes"],
  Gaming: ["Consoles", "Controllers", "Games", "Accessories"],
};

const AddProduct = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category) {
      alert("Please select a category");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", Number(price));
      formData.append("stock", Number(stock));
      formData.append("category", category);
      formData.append("subcategory", subcategory || "");

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await apiRequest("/products/", {
        method: "POST",
        body: formData,
      });

      navigate("/admin/manage-products");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl p-10">
        <h1 className="text-3xl font-bold mb-6">Add New Product</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* TITLE */}
          <input
            type="text"
            value={title}
            required
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Product title"
            className="w-full border p-3 rounded-lg"
          />

          {/* DESCRIPTION */}
          <textarea
            value={description}
            required
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows="4"
            className="w-full border p-3 rounded-lg"
          />

          {/* PRICE + STOCK */}
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="number"
              value={price}
              required
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              className="border p-3 rounded-lg"
            />

            <input
              type="number"
              value={stock}
              required
              onChange={(e) => setStock(e.target.value)}
              placeholder="Stock"
              className="border p-3 rounded-lg"
            />
          </div>

          {/* CATEGORY */}
          <select
            value={category}
            required
            onChange={(e) => {
              setCategory(e.target.value);
              setSubcategory("");
            }}
            className="w-full border p-3 rounded-lg"
          >
            <option value="">Select Category</option>
            {Object.keys(categories).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* SUBCATEGORY */}
          {category && (
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full border p-3 rounded-lg"
            >
              <option value="">Select Subcategory</option>
              {categories[category].map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          )}

          {/* IMAGE */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border p-3 rounded-lg"
          />

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg"
          >
            {loading ? "Uploading..." : "Create Product"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddProduct;