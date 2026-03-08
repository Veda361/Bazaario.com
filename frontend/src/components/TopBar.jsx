import { Link } from "react-router-dom";

const TopBar = () => {
  return (
    <div className="w-full bg-black border-b border-white/10 text-sm text-gray-300">
      <div className="max-w-7xl mx-auto px-6 h-10 flex items-center justify-between">

        <div className="flex items-center gap-6">

          <Link
            to="/sell"
            className="hover:text-netflixRed transition font-medium"
          >
            Sell Item
          </Link>

          <Link
            to="/resale"
            className="hover:text-netflixRed transition font-medium"
          >
            Refurbished
          </Link>

        </div>

        <div className="hidden md:flex items-center gap-6">

          <Link
            to="/orders"
            className="hover:text-netflixRed transition"
          >
            Track Orders
          </Link>

          <Link
            to="/wishlist"
            className="hover:text-netflixRed transition"
          >
            Wishlist
          </Link>

        </div>

      </div>
    </div>
  );
};

export default TopBar;