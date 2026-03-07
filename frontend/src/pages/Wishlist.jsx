import React from "react";
import { useWishlist } from "../context/WishlistContext";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";

const Wishlist = () => {
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="min-h-screen bg-netflixBlack px-12 py-20 text-white">

        {/* Heading */}
        <div className="mb-16 border-b-4 border-white pb-6">
          <h1 className="text-5xl font-black uppercase">
            Your Wishlist
          </h1>
        </div>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-40 text-center">

            <div className="text-7xl mb-8 opacity-60">❤️</div>

            <p className="text-gray-400 text-xl uppercase">
              No products added yet.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-10 px-12 py-4 uppercase font-bold
                         border-4 border-white
                         bg-netflixRed
                         shadow-[8px_8px_0px_#000]
                         transition-all duration-200
                         hover:bg-red-700
                         active:translate-x-2 active:translate-y-2 active:shadow-none"
            >
              Start Exploring
            </button>
          </div>
        ) : (

          /* Brutalist Wishlist Grid */
          <div className="flex flex-wrap gap-14 justify-center">

            {wishlist.map((product, index) => (
              <div
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="relative w-[300px] border-4 border-white
                           bg-netflixDark p-6
                           shadow-[12px_12px_0px_#E50914]
                           transition-all duration-200
                           hover:translate-x-3 hover:translate-y-3
                           hover:shadow-[20px_20px_0px_#E50914]
                           active:translate-x-2 active:translate-y-2
                           active:shadow-none
                           cursor-pointer group"
              >

                {/* Ribbon */}
                {index < 2 && (
                  <div className="absolute -top-3 -right-10 rotate-45 
                                  bg-netflixRed text-white text-xs 
                                  font-black px-12 py-1">
                    SAVED
                  </div>
                )}

                {/* Header */}
                <div className="border-b-2 border-white pb-4 mb-4">
                  <h3 className="font-black uppercase text-sm line-clamp-2">
                    {product.title}
                  </h3>
                </div>

                {/* Image */}
                <div className="flex justify-center items-center mb-4 border-b-2 border-white pb-4">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="h-40 object-contain transition duration-300 group-hover:scale-110"
                  />
                </div>

                {/* Price */}
                <p className="text-2xl font-extrabold text-netflixRed mb-4">
                  ₹{product.price}
                </p>

                {/* Button */}
                <button
                  className="w-full py-3 uppercase font-bold
                             border-4 border-white
                             bg-black
                             shadow-[6px_6px_0px_#000]
                             transition-all duration-200
                             hover:bg-gray-900
                             active:translate-x-2 active:translate-y-2 active:shadow-none"
                >
                  View Product
                </button>

              </div>
            ))}

          </div>
        )}

      </div>
    </PageWrapper>
  );
};

export default Wishlist;