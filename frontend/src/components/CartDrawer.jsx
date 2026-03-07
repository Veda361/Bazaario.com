import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cart = [], removeFromCart, increaseQty, decreaseQty } = useCart();
  const [animatingId, setAnimatingId] = useState(null);

  const totalPrice = cart.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 1),
    0
  );

  const handleIncrease = (id) => {
    setAnimatingId(id);
    increaseQty(id);

    toast.success("Quantity increased ➕", {
      position: "bottom-right",
    });

    setTimeout(() => setAnimatingId(null), 200);
  };

  const handleDecrease = (id) => {
    setAnimatingId(id);
    decreaseQty(id);

    toast.info("Quantity decreased ➖", {
      position: "bottom-right",
    });

    setTimeout(() => setAnimatingId(null), 200);
  };

  const handleRemove = (id) => {
    removeFromCart(id);

    toast.error("Item removed from cart ❌", {
      position: "bottom-right",
    });
  };

  // Safe Image Resolver
  const getImage = (item) => {
    if (!item) return "/placeholder.png";

    if (item.image_url && item.image_url.startsWith("http")) {
      return item.image_url;
    }

    if (item.image && item.image.startsWith("http")) {
      return item.image;
    }

    return "/placeholder.png";
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ${
          isOpen
            ? "bg-black/80 backdrop-blur-md opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[460px]
        bg-netflixBlack
        border-l-4 border-white
        shadow-[-20px_0px_0px_#E50914]
        z-50 flex flex-col
        transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)]
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b-4 border-white">
          <h2 className="text-2xl font-black uppercase">
            Shopping Cart
          </h2>
          <FaTimes
            className="cursor-pointer text-white hover:text-netflixRed transition text-xl"
            onClick={onClose}
          />
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
              <p className="text-xl uppercase font-bold mb-4">
                Your Cart Is Empty
              </p>
              <p className="text-sm">Add something legendary 😈</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="border-4 border-white bg-netflixDark p-6
                           shadow-[10px_10px_0px_#E50914]
                           transition-all duration-200
                           hover:translate-x-2 hover:translate-y-2
                           hover:shadow-[18px_18px_0px_#E50914]"
              >
                <div className="flex gap-5">

                  {/* Image */}
                  <div className="w-24 h-24 border-2 border-white 
                                  flex items-center justify-center bg-black">
                    <img
                      src={getImage(item)}
                      alt={item.title}
                      className="h-20 object-contain transition duration-300 hover:scale-110"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">

                    <div>
                      <h3 className="font-black uppercase text-sm mb-2">
                        {item.title}
                      </h3>

                      <p className="text-netflixRed font-extrabold text-xl">
                        ₹{(item.price || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 mt-4">

                      <button
                        onClick={() => handleDecrease(item.id)}
                        className="w-10 h-10 border-4 border-white 
                                   bg-black font-bold
                                   shadow-[4px_4px_0px_#000]
                                   active:translate-x-1 active:translate-y-1 active:shadow-none"
                      >
                        −
                      </button>

                      <span
                        className={`font-black text-lg w-6 text-center ${
                          animatingId === item.id ? "qty-animate" : ""
                        }`}
                      >
                        {item.quantity || 1}
                      </span>

                      <button
                        onClick={() => handleIncrease(item.id)}
                        className="w-10 h-10 border-4 border-white 
                                   bg-netflixRed font-bold
                                   shadow-[4px_4px_0px_#000]
                                   active:translate-x-1 active:translate-y-1 active:shadow-none"
                      >
                        +
                      </button>

                      <button
                        onClick={() => handleRemove(item.id)}
                        className="ml-auto text-xs uppercase font-bold
                                   text-red-400 hover:text-red-600 transition"
                      >
                        Remove
                      </button>

                    </div>

                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t-4 border-white bg-netflixDark">

          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-black uppercase">
              Total
            </span>

            <span className="text-3xl font-black text-netflixRed">
              ₹{totalPrice.toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => {
              onClose();

              toast.success("Redirecting to checkout ⚡", {
                position: "bottom-right",
              });

              navigate("/checkout");
            }}
            className="w-full py-4 uppercase font-black
                       border-4 border-white
                       bg-netflixRed
                       shadow-[8px_8px_0px_#000]
                       transition-all duration-200
                       hover:bg-red-700
                       hover:translate-x-2 hover:translate-y-2
                       hover:shadow-[14px_14px_0px_#000]
                       active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            Proceed to Checkout
          </button>

        </div>
      </div>
    </>
  );
};

export default CartDrawer;