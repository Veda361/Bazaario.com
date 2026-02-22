import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { role, user } = useAuth();

  // 1️⃣ Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2️⃣ Logged in but not admin
  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-2xl rounded-2xl p-10 text-center max-w-md">
          <h1 className="text-3xl font-bold text-red-500 mb-4">
            🚫 Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don’t have permission to access this page.
            Only administrators can perform this action.
          </p>

          <button
            onClick={() => window.location.href = "/"}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-yellow-400 hover:text-black transition"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // 3️⃣ Admin access granted
  return children;
};

export default AdminRoute;