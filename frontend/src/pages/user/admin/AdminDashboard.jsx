const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <a
          href="/add-product"
          className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition"
        >
          ➕ Add Product
        </a>

        <div className="bg-white shadow-lg rounded-xl p-6">
          📦 Manage Products
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6">
          👥 Manage Users
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;