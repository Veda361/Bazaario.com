import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: "📊" },
    { name: "Orders", path: "/admin/orders", icon: "📦" },
    { name: "Refund Requests", path: "/admin/refunds", icon: "💰" },
    { name: "Refund History", path: "/admin/refund-history", icon: "🧾" },
    { name: "Manage Products", path: "/admin/manage-products", icon: "🛍" },
    { name: "Resale Requests", path: "/admin/resale-requests", icon: "🔁" },
    { name: "Resale Products", path: "/admin/resale-products", icon: "♻" },
  ];

  return (
    <div className="flex min-h-screen bg-netflixBlack text-white">

      {/* Sidebar */}
      <div className="w-72 bg-netflixDark border-r border-white/10 p-8 shadow-xl">

        <h2 className="text-2xl font-bold mb-10 text-netflixRed tracking-wide">
          Bazaario Admin
        </h2>

        <nav className="space-y-3">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                  ${
                    isActive
                      ? "bg-netflixRed text-white shadow-glow"
                      : "text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <span>{item.icon}</span>
                <span className="font-medium tracking-wide">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => navigate("/")}
          className="mt-12 text-sm text-gray-400 hover:text-netflixRed transition"
        >
          ⬅ Back to Site
        </button>

      </div>

      {/* Content Area */}
      <div className="flex-1 p-12 bg-netflixBlack">
        <Outlet />
      </div>

    </div>
  );
};

export default AdminLayout;