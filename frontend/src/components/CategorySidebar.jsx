import React, { useState, useEffect } from "react";
import {
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { categoriesData } from "../data/categories";

const CategorySidebar = ({ onClose }) => {
  const [openCategory, setOpenCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  /* ================= TEXT NORMALIZATION ================= */
  const normalizeText = (text) =>
    text
      ?.toLowerCase()
      .trim()
      .replace(/[^\w\s]/gi, "");

  /* ================= DEBOUNCED SEARCH ================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(normalizeText(search));
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  const toggleCategory = (name) => {
    setOpenCategory(openCategory === name ? null : name);
  };

  const handleNavigate = (category, subcategory) => {
    navigate(`/products/${category}/${subcategory}`);
    if (onClose) onClose();
  };

  /* ================= FILTER CATEGORIES ================= */
  const filteredCategories = categoriesData
    .map((category) => {
      const normalizedCategory = normalizeText(category.name);

      const filteredSubs = category.subcategories.filter((sub) =>
        normalizeText(sub).includes(debouncedSearch)
      );

      if (
        normalizedCategory.includes(debouncedSearch) ||
        filteredSubs.length > 0
      ) {
        return {
          ...category,
          subcategories: filteredSubs.length
            ? filteredSubs
            : category.subcategories,
        };
      }

      return null;
    })
    .filter(Boolean);

  const displayCategories =
    debouncedSearch.length > 0 ? filteredCategories : categoriesData;

  return (
    <div
      className="w-[360px] h-screen
                 bg-netflixBlack
                 border-r-4 border-white
                 shadow-[20px_0px_0px_#E50914]
                 text-white p-10 overflow-y-auto"
    >
      {/* HEADER */}
      <h2 className="text-4xl font-black uppercase mb-8 border-b-4 border-white pb-4">
        Discover
      </h2>

      {/* ================= SEARCH ================= */}
      <div className="mb-10">
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-5 py-3 rounded-xl
                     bg-netflixDark
                     border-4 border-white
                     shadow-[6px_6px_0px_#E50914]
                     focus:outline-none
                     focus:border-netflixRed
                     transition"
        />
      </div>

      {/* ================= CATEGORY LIST ================= */}
      {displayCategories.map((category) => {
        const Icon = category.icon;
        const isOpen = openCategory === category.name;

        return (
          <div key={category.name} className="mb-8">

            {/* MAIN CATEGORY */}
            <div
              onClick={() => toggleCategory(category.name)}
              className={`group flex justify-between items-center
                          border-4 border-white
                          bg-netflixDark p-5
                          shadow-[8px_8px_0px_#E50914]
                          cursor-pointer
                          transition-all duration-200
                          hover:translate-x-2 hover:translate-y-2
                          hover:shadow-[14px_14px_0px_#E50914]
                          active:translate-x-1 active:translate-y-1 active:shadow-none
                          ${isOpen ? "bg-black" : ""}`}
            >
              <div className="flex items-center gap-4">
                <Icon className="text-lg text-netflixRed transition group-hover:rotate-6" />
                <span className="font-black uppercase tracking-wide">
                  {category.name}
                </span>
              </div>

              <div
                className={`transition-transform duration-300 ${
                  isOpen ? "rotate-180 text-netflixRed" : ""
                }`}
              >
                {isOpen ? <FaChevronDown /> : <FaChevronRight />}
              </div>
            </div>

            {/* SUBCATEGORIES */}
            <div
              className={`overflow-hidden transition-all duration-500 ${
                isOpen
                  ? "max-h-[600px] opacity-100 mt-6"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="ml-6 space-y-5 py-4">

                {category.subcategories.map((sub) => {
                  const isActive =
                    location.pathname ===
                    `/products/${category.name}/${sub}`;

                  return (
                    <div
                      key={sub}
                      onClick={() =>
                        handleNavigate(category.name, sub)
                      }
                      className={`flex justify-between items-center
                                  border-2 border-white
                                  bg-netflixDark px-4 py-3
                                  shadow-[4px_4px_0px_#000]
                                  cursor-pointer
                                  transition-all duration-200
                                  hover:translate-x-2 hover:translate-y-2
                                  hover:shadow-[8px_8px_0px_#000]
                                  active:translate-x-1 active:translate-y-1 active:shadow-none
                                  ${
                                    isActive
                                      ? "text-netflixRed font-bold"
                                      : "text-gray-300"
                                  }`}
                    >
                      <span className="uppercase text-sm">
                        {sub}
                      </span>

                      {/* Brutalist Badge */}
                      <span
                        className="text-xs font-black
                                   border-2 border-white
                                   px-3 py-1
                                   bg-black"
                      >
                        {Math.floor(Math.random() * 40) + 5}
                      </span>
                    </div>
                  );
                })}

              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default CategorySidebar;