import React from "react";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import PageWrapper from "../components/PageWrapper";
const Checkout = () => {
  const { cart } = useCart();
  const { placeOrder } = useOrders();
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (!auth.currentUser) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    alert("Payment Successful 🎉");
    await placeOrder(auth.currentUser.email, "demo_payment_id");
    navigate("/orders");
  };

  return (
    <PageWrapper>
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10 transition-all duration-500 ease-in-out">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl p-10 grid md:grid-cols-2 gap-10">

        <div>
          <h2 className="text-2xl font-bold mb-6 dark:text-white">
            Your Items
          </h2>

          {cart.map((item) => (
            <div key={item.id} className="flex justify-between border-b py-4 dark:text-gray-300">
              <span>
                {item.title} (x{item.quantity})
              </span>
              <span>
                ₹{(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-6 dark:text-white">
            Order Summary
          </h3>

          <div className="flex justify-between mb-4 dark:text-gray-300">
            <span>Total Items</span>
            <span>{cart.length}</span>
          </div>

          <div className="flex justify-between font-bold text-xl mb-6 dark:text-yellow-400">
            <span>Total Amount</span>
            <span>₹{total.toLocaleString()}</span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-yellow-400 text-black py-3 rounded-lg hover:bg-yellow-500 transition font-semibold"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
    </PageWrapper>
  );
};

export default Checkout;