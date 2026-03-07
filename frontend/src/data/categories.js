import {
  FaLaptop,
  FaTshirt,
  FaMobileAlt,
  FaCouch,
  FaGamepad,
} from "react-icons/fa";

export const categoriesData = [
  {
    name: "Electronics",
    icon: FaLaptop,
    subcategories: ["Laptops", "Headphones", "Cameras", "Accessories"],
  },
  {
    name: "Mobiles",
    icon: FaMobileAlt,
    subcategories: ["iPhone", "Samsung", "OnePlus", "Realme"],
  },
  {
    name: "Fashion",
    icon: FaTshirt,
    subcategories: ["Men", "Women", "Kids", "Footwear"],
  },
  {
    name: "Furniture",
    icon: FaCouch,
    subcategories: ["Sofa", "Beds", "Tables", "Wardrobes"],
  },
  {
    name: "Gaming",
    icon: FaGamepad,
    subcategories: ["Consoles", "Controllers", "Games", "Accessories"],
  },
];