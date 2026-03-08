import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaBars, FaSearch, FaHeart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import Logo from "../assets/logo.svg";

import CategorySidebar from "./CategorySidebar";
import CartDrawer from "./CartDrawer";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

import { categoriesData } from "../data/categories";

import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { role, user } = useAuth();
  const { wishlist = [] } = useWishlist();
  const { cart = [] } = useCart();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [activeCategory, setActiveCategory] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();

  const totalQuantity = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  const normalizeText = (text) =>
    text?.toLowerCase().trim().replace(/[^\w\s]/gi, "");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(normalizeText(search));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    navigate("/");
  };

  const handleSearch = () => {
    const query = normalizeText(search);
    if (!query) return;

    navigate(`/search?q=${encodeURIComponent(query)}`);
    setSearch("");
  };

  return (
    <>
      <nav
        className={`sticky top-0 w-full z-50 transition-all duration-500 backdrop-blur-xl ${
          scrolled
            ? "bg-black/95 border-b border-white/10 shadow-xl"
            : "bg-black/60"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* LEFT */}
            <div className="flex items-center gap-5">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="hover:text-netflixRed transition transform hover:scale-110"
              >
                <FaBars size={18} />
              </button>

              <Link to="/" className="flex items-center gap-2 group">
                <img
                  src={Logo}
                  alt="Bazaario"
                  className="h-9 w-9 transition-transform group-hover:rotate-6"
                />
                <span className="text-2xl font-bold tracking-wide">
                  <span className="text-netflixRed">Baza</span>
                  <span className="text-white">ario</span>
                </span>
              </Link>
            </div>

            {/* SEARCH */}
            <div className="flex-1 mx-6 hidden md:flex relative">
              <FaSearch className="absolute left-4 top-3 text-gray-400" />

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="w-full pl-10 pr-6 py-2 rounded-2xl
                bg-white/10 border border-white/20
                focus:border-netflixRed focus:outline-none"
              />
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-6 text-white">

              {/* WISHLIST */}
              <Link
                to="/wishlist"
                className="relative hover:text-netflixRed transition"
              >
                <FaHeart size={18} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-3 bg-netflixRed text-xs px-2 rounded-full">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* CART */}
              <div
                onClick={() => setIsCartOpen(true)}
                className="relative cursor-pointer hover:text-netflixRed transition"
              >
                <FaShoppingCart size={18} />
                {totalQuantity > 0 && (
                  <span className="absolute -top-2 -right-3 bg-netflixRed text-xs px-2 rounded-full">
                    {totalQuantity}
                  </span>
                )}
              </div>

              {/* USER */}
              {user ? (
                <div
                  className="relative flex items-center gap-3 cursor-pointer"
                  onMouseEnter={() => setIsProfileOpen(true)}
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/20">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-netflixRed flex items-center justify-center font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <span className="hidden md:block text-sm text-gray-200">
                    {user.email}
                  </span>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-12 w-72
                        bg-black/95 border border-white/10
                        rounded-2xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="px-5 py-4 border-b border-white/10">
                          <p className="text-sm text-gray-400">Signed in as</p>
                          <p className="text-white font-semibold truncate">
                            {user.email}
                          </p>
                        </div>

                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-5 py-3 hover:bg-white/10"
                        >
                          👤 Profile
                        </Link>

                        <Link
                          to="/wishlist"
                          className="flex items-center gap-3 px-5 py-3 hover:bg-white/10"
                        >
                          ❤️ Wishlist
                        </Link>

                        {role === "admin" && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-5 py-3 hover:bg-white/10 text-netflixRed"
                          >
                            ⚙ Admin Panel
                          </Link>
                        )}

                        <div className="border-t border-white/10" />

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-5 py-3 hover:bg-white/10"
                        >
                          🚪 Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link to="/login" className="hover:text-netflixRed">
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    className="bg-netflixRed px-4 py-2 rounded-xl hover:bg-red-700"
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-500 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <CategorySidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;