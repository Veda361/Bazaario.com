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

import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";

import { apiRequest } from "../api";

const Navbar = () => {
  const { role, user } = useAuth();
  const { wishlist = [] } = useWishlist();
  const { cart = [] } = useCart();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();

  const totalQuantity = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  /* ================= FETCH PRODUCTS FOR SEARCH ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiRequest("/products/?page=1&limit=500");
        setAllProducts(data.items || []);
      } catch (err) {
        console.error("Search preload failed", err);
      }
    };

    fetchProducts();
  }, []);

  /* ================= FUSE SEARCH ================= */
  const fuse = new Fuse(allProducts, {
    keys: [
      { name: "title", weight: 0.6 },
      { name: "category", weight: 0.3 },
      { name: "description", weight: 0.1 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
  });

  const handleSearchChange = (value) => {
    setSearch(value);

    if (!value) {
      setSuggestions([]);
      return;
    }

    const results = fuse.search(value).slice(0, 6);
    setSuggestions(results.map((r) => r.item));
  };

  const handleSearch = () => {
    if (!search.trim()) return;
    navigate(`/search?q=${encodeURIComponent(search)}`);
    setSuggestions([]);
    setSearch("");
  };

  /* ================= SCROLL EFFECT ================= */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <nav
        className={`sticky top-0 w-full z-50 backdrop-blur-xl ${
          scrolled
            ? "bg-black/95 border-b border-white/10 shadow-xl"
            : "bg-black/70"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* LEFT */}
            <div className="flex items-center gap-5">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="hover:text-netflixRed transition"
              >
                <FaBars size={18} />
              </button>

              <Link to="/" className="flex items-center gap-2">
                <img src={Logo} alt="Bazaario" className="h-9 w-9" />
                <span className="text-2xl font-bold tracking-wide">
                  <span className="text-netflixRed">Baza</span>
                  <span className="text-white">ario</span>
                </span>
              </Link>
            </div>

            {/* ================= SEARCH ================= */}
            <div className="flex-1 mx-6 hidden md:flex relative">
              <FaSearch className="absolute left-4 top-3 text-gray-400" />

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-6 py-2 rounded-2xl
                bg-white/10 border border-white/20
                focus:border-netflixRed focus:outline-none"
              />

              {/* ================= SEARCH SUGGESTIONS ================= */}
              {suggestions.length > 0 && (
                <div className="absolute top-12 left-0 w-full bg-black border border-white/10 rounded-xl shadow-xl z-50">

                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        navigate(`/product/${item.id}`);
                        setSuggestions([]);
                        setSearch("");
                      }}
                      className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-white/10"
                    >
                      <img
                        src={item.image_url}
                        className="w-10 h-10 object-contain"
                        alt={item.title}
                      />

                      <div>
                        <p className="text-sm font-semibold">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.category}
                        </p>
                      </div>
                    </div>
                  ))}

                </div>
              )}
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-6 text-white">

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

              {user ? (
                <div
                  className="relative flex items-center gap-3 cursor-pointer"
                  onMouseEnter={() => setIsProfileOpen(true)}
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  <div className="w-9 h-9 rounded-full bg-netflixRed flex items-center justify-center font-bold">
                    {user.email?.charAt(0).toUpperCase()}
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
                        bg-black border border-white/10 rounded-xl"
                      >
                        <Link
                          to="/profile"
                          className="block px-5 py-3 hover:bg-white/10"
                        >
                          Profile
                        </Link>

                        <Link
                          to="/wishlist"
                          className="block px-5 py-3 hover:bg-white/10"
                        >
                          Wishlist
                        </Link>

                        {role === "admin" && (
                          <Link
                            to="/admin"
                            className="block px-5 py-3 text-netflixRed hover:bg-white/10"
                          >
                            Admin Panel
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-5 py-3 hover:bg-white/10"
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link to="/login">Login</Link>
                  <Link
                    to="/signup"
                    className="bg-netflixRed px-4 py-2 rounded-lg"
                  >
                    Sign Up
                  </Link>
                </>
              )}

            </div>
          </div>
        </div>

        {/* ================= NAV BAR BELOW ================= */}

        <div className="w-full bg-black border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 h-10 flex items-center gap-8 text-sm text-gray-300">

            <Link to="/sell" className="hover:text-netflixRed transition">
              Sell Item
            </Link>

            <Link to="/resale" className="hover:text-netflixRed transition">
              Refurbished
            </Link>

            <Link to="/orders" className="hover:text-netflixRed transition">
              Track Orders
            </Link>

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
        className={`fixed top-0 left-0 h-full z-50 transform transition-transform ${
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