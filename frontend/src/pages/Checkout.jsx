import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import PageWrapper from "../components/PageWrapper";
import { toast } from "react-toastify";

const API_BASE = "https://bazaario-com.onrender.com/api/payment";

const Checkout = () => {
  const { cart = [], clearCart } = useCart();
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  const handleCheckout = async () => {
    if (!auth.currentUser) {
      toast.error("Please login first 🔐");
      return;
    }

    if (cart.length === 0) {
      toast.info("Cart is empty 🛒");
      return;
    }

    try {
      const token = await auth.currentUser.getIdToken(true);

      const res = await fetch(`${API_BASE}/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          cart,
        }),
      });

      const order = await res.json();

      if (!res.ok) {
        console.error(order);
        toast.error(order.detail || "Order creation failed ❌");
        return;
      }

      const options = {
        key: "rzp_test_SKGdWUi6rOlRrn",
        amount: order.amount,
        currency: "INR",
        name: "Bazaario",
        description: "Order Payment",
        order_id: order.id,

        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE}/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(response),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.status) {
              toast.error("Payment verification failed ❌");
              return;
            }

            clearCart();
            toast.success("Payment Successful 🎉");
            navigate("/orders");

          } catch (err) {
            console.error(err);
            toast.error("Verification error ❌");
          }
        },

        modal: {
          ondismiss: async () => {
            try {
              await fetch(`${API_BASE}/payment-failed`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: order.id,
                  reason: "User closed payment popup",
                }),
              });
            } catch (err) {
              console.error(err);
            }

            toast.info("Payment cancelled");
          },
        },

        prefill: {
          email: auth.currentUser.email,
        },

        theme: {
          color: "#E50914",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error(error);
      toast.error("Payment failed ❌");
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-netflixBlack px-8 py-14 text-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">

          {/* CART ITEMS */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
            <h2 className="text-3xl font-bold mb-8">Your Items</h2>

            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b border-white/10 py-4"
              >
                <div>
                  <p>{item.title}</p>
                  <p className="text-gray-400 text-sm">
                    Qty: {item.quantity}
                  </p>
                </div>

                <p className="text-netflixRed font-bold">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className="bg-netflixDark p-10 rounded-3xl border border-white/10">
            <h3 className="text-2xl mb-6">Order Summary</h3>

            <div className="flex justify-between mb-6">
              <span>Total</span>
              <span className="text-netflixRed text-xl">
                ₹{total.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-netflixRed py-4 rounded-xl font-bold hover:bg-red-700"
            >
              Secure Payment
            </button>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
};

export default Checkout;