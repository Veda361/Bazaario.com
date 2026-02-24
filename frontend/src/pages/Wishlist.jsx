import React from "react";
import { useWishlist } from "../context/WishlistContext";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
const Wishlist = () => {
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <PageWrapper>
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10 transition-all duration-500 ease-in-out">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">
        Your Wishlist
      </h1>

      {wishlist.length === 0 ? (
        <p className="dark:text-gray-400">No items added.</p>
      ) : (
        <div className="grid md:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow cursor-pointer hover:scale-[1.02] transform transition duration-300"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <img
                src={product.image_url}
                className="h-40 object-contain mx-auto"
                alt={product.title}
              />
              <h3 className="mt-3 dark:text-white">
                {product.title}
              </h3>
              <p className="font-bold dark:text-yellow-400">
                ₹{product.price}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
    </PageWrapper>
  );
};

export default Wishlist;