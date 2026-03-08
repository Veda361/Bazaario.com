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
    <div className="min-h-screen bg-netflixBlack px-10 py-16 text-white">

      <div
        className="max-w-3xl mx-auto
        border-4 border-white
        bg-netflixDark
        p-10
        shadow-[10px_10px_0px_#E50914]"
      >

        <h1 className="text-4xl font-black uppercase mb-10 border-b-4 border-white pb-4">
          Add New Product
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* TITLE */}
          <input
            type="text"
            value={title}
            required
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Product Title"
            className="w-full border-4 border-white bg-black p-4 font-bold"
          />

          {/* DESCRIPTION */}
          <textarea
            value={description}
            required
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Product Description"
            rows="4"
            className="w-full border-4 border-white bg-black p-4 font-bold"
          />

          {/* PRICE + STOCK */}
          <div className="grid md:grid-cols-2 gap-6">
            <input
              type="number"
              value={price}
              required
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              className="border-4 border-white bg-black p-4 font-bold"
            />

            <input
              type="number"
              value={stock}
              required
              onChange={(e) => setStock(e.target.value)}
              placeholder="Stock"
              className="border-4 border-white bg-black p-4 font-bold"
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
            className="w-full border-4 border-white bg-black p-4 font-bold"
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
              className="w-full border-4 border-white bg-black p-4 font-bold"
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
            className="w-full border-4 border-white bg-black p-4 font-bold"
          />

          {/* PREVIEW */}
          {preview && (
            <div className="border-4 border-white p-4 bg-black">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-56 object-cover"
              />
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full
            border-4 border-white
            bg-netflixRed
            py-4
            uppercase
            font-black
            shadow-[6px_6px_0px_#000]
            hover:bg-red-700
            active:translate-x-2 active:translate-y-2 active:shadow-none"
          >
            {loading ? "Uploading..." : "Create Product"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddProduct;