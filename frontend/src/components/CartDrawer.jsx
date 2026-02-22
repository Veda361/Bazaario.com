import React from "react";
import { useCart } from "../context/CartContext";
import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cart, removeFromCart, increaseQty, decreaseQty } = useCart();

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <FaTimes className="cursor-pointer text-gray-600" onClick={onClose} />
        </div>

        <div className="p-6 space-y-6 overflow-y-auto h-[70%]">
          {cart.length === 0 ? (
            <p className="text-gray-500">Cart is empty</p>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border-b pb-4"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 object-contain"
                />

                <div className="flex-1">
                  <h3 className="text-sm font-semibold">{item.title}</h3>

                  <p className="text-sm text-gray-600">
                    ₹{item.price.toLocaleString()}
                  </p>

                  {/* 🔥 Quantity Controls */}
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="px-2 bg-gray-200 rounded"
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() => increaseQty(item.id)}
                      className="px-2 bg-gray-200 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        <div className="absolute bottom-0 w-full p-6 border-t bg-white">
          <div className="flex justify-between font-bold mb-4">
            <span>Total:</span>
            <span>₹{totalPrice.toLocaleString()}</span>
          </div>
          <button
            onClick={() => {
              onClose(); // close drawer
              navigate("/checkout");
            }}
            className="w-full bg-yellow-400 text-black py-3 rounded-lg hover:bg-yellow-500 transition"
          >
            Checkout
          </button>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
