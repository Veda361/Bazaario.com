import React from "react";
import { useCart } from "../../context/CartContext";
import { useOrders } from "../../context/OrderContext";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";

const Checkout = () => {
  const { cart } = useCart();
  const { placeOrder } = useOrders();
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    try {
      if (!auth.currentUser) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      if (cart.length === 0) {
        alert("Cart is empty");
        return;
      }

      // 🔥 1️⃣ CREATE ORDER FROM BACKEND
      const orderResponse = await fetch(
        "http://localhost:8000/api/payment/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total }),
        }
      );

      if (!orderResponse.ok) {
        throw new Error("Failed to create Razorpay order");
      }

      const orderData = await orderResponse.json();

      // 🔥 2️⃣ RAZORPAY CONFIG
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // ⚠️ Use env
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Bazaario",
        description: "Order Payment",
        order_id: orderData.id,

        handler: async function (response) {
          try {
            // 🔥 3️⃣ VERIFY PAYMENT
            const verifyResponse = await fetch(
              "http://localhost:8000/api/payment/verify-payment",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              }
            );

            const verifyData = await verifyResponse.json();

            if (verifyData.status === "Payment Verified") {

              // 🔥 4️⃣ SAVE ORDER
              await placeOrder(
                auth.currentUser.email,
                response.razorpay_payment_id
              );

              alert("Payment Successful 🎉");
              navigate("/orders");
            } else {
              alert("Payment verification failed");
            }

          } catch (err) {
            console.error(err);
            alert("Payment verification error");
          }
        },

        prefill: {
          email: auth.currentUser.email,
        },

        theme: {
          color: "#F59E0B",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error(error);
      alert("Checkout failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="bg-white p-10 rounded-xl shadow-lg max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Checkout</h2>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between border-b py-4">
                <span>
                  {item.title} (x{item.quantity})
                </span>
                <span>
                  ₹{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}

            <div className="flex justify-between font-bold text-xl mt-6">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="mt-6 w-full bg-black text-white py-3 rounded-lg hover:bg-yellow-400 hover:text-black transition"
            >
              Pay with Razorpay
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;