import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await apiRequest(
        `/products/?page=${page}&limit=10&sort_by=id&order=desc`
      );

      setProducts(data.items || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await apiRequest(`/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-netflixBlack text-white p-10">

      <div className="flex justify-between mb-8">
        <h1 className="text-4xl font-black">Manage Products</h1>

        <button
          onClick={() => navigate("/admin/add-product")}
          className="border-4 border-white px-5 py-2 bg-netflixRed font-bold shadow-[6px_6px_0px_#000]"
        >
          + Add Product
        </button>
      </div>

      {loading && <p>Loading...</p>}

      <div className="overflow-x-auto border border-white/10 bg-netflixDark">
        <table className="w-full text-left">

          <thead className="bg-white/10">
            <tr>
              <th className="p-4">Image</th>
              <th className="p-4">Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-white/10">

                <td className="p-4">
                  {p.image_url && (
                    <img
                      src={p.image_url}
                      className="w-16 h-16 object-cover"
                    />
                  )}
                </td>

                <td className="p-4">{p.title}</td>

                <td className="p-4">
                  {p.category}
                  <span className="block text-gray-400 text-xs">
                    {p.subcategory}
                  </span>
                </td>

                <td className="p-4 text-netflixRed font-bold">
                  ₹{p.price}
                </td>

                <td className="p-4">
                  {p.stock > 0 ? p.stock : "Out of stock"}
                </td>

                <td className="p-4 flex gap-3">

                  <button
                    onClick={() =>
                      navigate(`/admin/edit-product/${p.id}`)
                    }
                    className="bg-yellow-500 px-3 py-1"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(p.id)}
                    className="bg-red-600 px-3 py-1"
                  >
                    Delete
                  </button>

                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

      <div className="flex justify-center gap-6 mt-8">

        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="bg-white text-black px-4 py-2"
        >
          Prev
        </button>

        <span>
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="bg-white text-black px-4 py-2"
        >
          Next
        </button>

      </div>

    </div>
  );
};

export default ManageProducts;