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
      console.error("Failed to fetch products:", err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;

    try {
      await apiRequest(`/products/${id}`, {
        method: "DELETE",
      });

      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Products</h1>

        <button
          onClick={() => navigate("/admin/add-product")}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          + Add Product
        </button>
      </div>

      {loading && <p>Loading products...</p>}

      {!loading && products.length === 0 && (
        <p>No products found.</p>
      )}

      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="p-3">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                </td>

                <td className="p-3">{product.title}</td>

                <td className="p-3">
                  {product.category}
                  {product.subcategory && (
                    <span className="text-gray-400 text-xs block">
                      {product.subcategory}
                    </span>
                  )}
                </td>

                <td className="p-3 font-semibold">₹ {product.price}</td>

                <td className="p-3">
                  {product.stock > 0 ? (
                    <span className="text-green-600">
                      {product.stock}
                    </span>
                  ) : (
                    <span className="text-red-600">Out of stock</span>
                  )}
                </td>

                <td className="p-3 space-x-2">
                  <button
                    onClick={() =>
                      navigate(`/admin/edit-product/${product.id}`)
                    }
                    className="px-3 py-1 bg-yellow-400 rounded text-black"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-3 py-1 bg-red-500 rounded text-white"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ManageProducts;