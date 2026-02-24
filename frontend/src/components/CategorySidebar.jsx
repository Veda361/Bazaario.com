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

const CategorySidebar = ({ onClose }) => {
  const [openCategory, setOpenCategory] = useState(null);
  const navigate = useNavigate();

  const toggleCategory = (name) => {
    setOpenCategory(openCategory === name ? null : name);
  };

  const handleNavigate = (category, subcategory) => {
    navigate(`/products/${category}/${subcategory}`);
    if (onClose) onClose(); // close sidebar if passed
  };

  return (
    <div className="w-72 h-screen bg-[#0F172A] text-white p-6">
      <h2 className="text-2xl font-bold mb-6">Categories</h2>

      {categoriesData.map((category) => (
        <div key={category.name}>
          <div
            onClick={() => toggleCategory(category.name)}
            className="flex justify-between items-center p-3 hover:bg-[#1E293B] cursor-pointer rounded"
          >
            <div className="flex items-center gap-3">
              {category.icon}
              {category.name}
            </div>

            {openCategory === category.name ? (
              <FaChevronDown />
            ) : (
              <FaChevronRight />
            )}
          </div>

          {openCategory === category.name && (
            <div className="ml-6 mt-2 space-y-2">
              {category.subcategories.map((sub) => (
                <div
                  key={sub}
                  onClick={() =>
                    handleNavigate(category.name, sub)
                  }
                  className="cursor-pointer text-gray-400 hover:text-yellow-400 transition"
                >
                  {sub}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CategorySidebar;