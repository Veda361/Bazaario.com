import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaBars } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import Logo from "../assets/logo.svg";
import CategorySidebar from "./CategorySidebar";
import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useWishlist } from "../context/WishlistContext";

const Navbar = () => {
  const { darkMode, toggleTheme } = useTheme(); // ✅ MOVE HERE
  

  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { wishlist } = useWishlist();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { role } = useAuth();

  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <>
      <nav className="bg-black shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* LEFT */}
            <div className="flex items-center gap-4">
              {role === "admin" && (
                <Link to="/admin">
                  <button className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition">
                    Admin Panel
                  </button>
                </Link>
              )}

              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-2 text-white hover:text-yellow-400 transition"
              >
                <FaBars />
                <span className="hidden sm:block">All</span>
              </button>

              <img src={Logo} alt="Bazaario Logo" className="h-10 w-10" />

              <Link to="/" className="text-2xl font-bold text-white">
                <span className="text-red-500">Baza</span>ario
              </Link>
            </div>

            {/* SEARCH */}
            <div className="flex-1 mx-6 hidden md:flex">
              <input
                type="text"
                placeholder="Search for products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && search.trim() !== "") {
                    navigate(`/search?q=${search}`);
                    setSearch("");
                  }
                }}
                className="w-full px-5 py-2 rounded-full bg-white text-gray-800 focus:outline-none focus:ring-4 focus:ring-yellow-400 transition"
              />
            </div>

            {/* RIGHT */}
            <div className="flex items-center space-x-6 text-white">
              {/* ❤️ WISHLIST */}
              <Link
                to="/wishlist"
                className="relative hover:text-red-400 transition"
              >
                <span className="text-xl">❤️</span>

                {/* Wishlist Count */}
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* 🛒 CART */}
              <div
                onClick={() => setIsCartOpen(true)}
                className="relative cursor-pointer hover:text-yellow-400 transition"
              >
                <FaShoppingCart className="text-xl" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-2 -right-3 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                    {totalQuantity}
                  </span>
                )}
              </div>

              {/* AUTH */}
              {user ? (
                <>
                  <span className="text-sm hidden md:block">
                    Hi, {user.email}
                  </span>

                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                  >
                    Logout
                  </button>

                  <button
                    onClick={toggleTheme}
                    className="px-3 py-2 bg-yellow-400 rounded-lg hover:bg-yellow-600 transition"
                  >
                    {darkMode ? "☀️" : "🌙"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-200 transition"
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    className="px-4 py-2 rounded-full bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <CategorySidebar />
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
