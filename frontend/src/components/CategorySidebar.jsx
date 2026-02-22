import React, { useState } from "react";
import {
  FaChevronDown,
  FaChevronRight,
  FaLaptop,
  FaTshirt,
  FaMobileAlt,
  FaCouch,
  FaGamepad,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const categoriesData = [
  {
    name: "Electronics",
    icon: <FaLaptop />,
    subcategories: ["Laptops", "Headphones", "Cameras", "Accessories"],
  },
  {
    name: "Mobiles",
    icon: <FaMobileAlt />,
    subcategories: ["iPhone", "Samsung", "OnePlus", "Realme"],
  },
  {
    name: "Fashion",
    icon: <FaTshirt />,
    subcategories: ["Men", "Women", "Kids", "Footwear"],
  },
  {
    name: "Furniture",
    icon: <FaCouch />,
    subcategories: ["Sofa", "Beds", "Tables", "Wardrobes"],
  },
  {
    name: "Gaming",
    icon: <FaGamepad />,
    subcategories: ["Consoles", "Controllers", "Games", "Accessories"],
  },
];

const CategorySidebar = () => {
  const [openCategory, setOpenCategory] = useState(null);

  const toggleCategory = (name) => {
    setOpenCategory(openCategory === name ? null : name);
  };
  const navigate = useNavigate();

  return (
    <div className="w-72 h-screen bg-[#0F172A] text-white shadow-xl border-r border-gray-800 p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-8 tracking-wide">Categories</h2>

      <div className="space-y-4">
        {categoriesData.map((category) => (
          <div key={category.name}>
            {/* Main Category */}
            <div
              onClick={() => toggleCategory(category.name)}
              className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-[#1E293B] transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 text-gray-300 group-hover:text-yellow-400 transition">
                <span className="text-lg">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </div>

              {openCategory === category.name ? (
                <FaChevronDown className="text-sm text-gray-400" />
              ) : (
                <FaChevronRight className="text-sm text-gray-400" />
              )}
            </div>

            {/* Subcategories */}
            {openCategory === category.name && (
              <div className="ml-10 mt-2 space-y-2">
                {category.subcategories.map((sub) => (
                  <div
                    key={sub}
                    onClick={() =>
                      navigate(`/products/${category.name}/${sub}`)
                    }
                    className="text-sm text-gray-400 hover:text-yellow-400 cursor-pointer transition"
                  >
                    {sub}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySidebar;
