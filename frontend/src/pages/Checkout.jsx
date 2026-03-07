import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import PageWrapper from "../components/PageWrapper";
import { toast } from "react-toastify";

const Checkout = () => {
  const { cart = [], clearCart } = useCart();
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  const handleCheckout = async () => {
    if (!auth.currentUser) {
      toast.error("Please login first 🔐", { position: "bottom-right" });
      return;
    }

    if (cart.length === 0) {
      toast.info("Cart is empty 🛒", { position: "bottom-right" });
      return;
    }

    try {
      const token = await auth.currentUser.getIdToken(true);

      const res = await fetch(
        "http://localhost:8000/api/payment/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: Math.round(total * 100),
            cart: cart,
          }),
        }
      );

      const order = await res.json();

      if (!res.ok || !order.id) {
        toast.error("Order creation failed ❌", { position: "bottom-right" });
        return;
      }

      if (!window.Razorpay) {
        toast.error("Razorpay SDK not loaded 💳", { position: "bottom-right" });
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
            const verifyRes = await fetch(
              "http://localhost:8000/api/payment/verify-payment",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            if (!verifyRes.ok) {
              const errorData = await verifyRes.json();

              await fetch("http://localhost:8000/api/payment/payment-failed", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: order.id,
                  reason: errorData.detail || "Verification failed",
                }),
              });

              toast.error("Payment verification failed ❌", {
                position: "bottom-right",
              });
              return;
            }

            const verifyData = await verifyRes.json();

            if (verifyData.status !== true) {
              toast.error("Unexpected verification response ❌", {
                position: "bottom-right",
              });
              return;
            }

            clearCart();

            toast.success("Payment Successful 🎉", {
              position: "bottom-right",
            });

            navigate("/orders");
          } catch (err) {
            console.error("Verification error:", err);

            toast.error("Payment verification error ❌", {
              position: "bottom-right",
            });
          }
        },

        modal: {
          ondismiss: async function () {
            try {
              await fetch("http://localhost:8000/api/payment/payment-failed", {
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

              toast.info("Payment cancelled", {
                position: "bottom-right",
              });
            } catch (err) {
              console.error("Failed tracking error:", err);
            }
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

      rzp.on("payment.failed", async function () {
        toast.error("Payment Failed ❌", {
          position: "bottom-right",
        });
      });

      rzp.open();
    } catch (error) {
      console.error("Checkout error:", error);

      toast.error("Payment failed. Try again ❌", {
        position: "bottom-right",
      });
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-netflixBlack px-8 py-14">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">

          {/* LEFT */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl">
            <h2 className="text-3xl font-bold mb-8">Your Items</h2>

            {cart.length === 0 ? (
              <p className="text-gray-400">Your cart is empty.</p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b border-white/10 py-5"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-400">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold text-netflixRed">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* RIGHT */}
          <div className="bg-gradient-to-br from-netflixDark to-black rounded-3xl p-10 border border-white/10 shadow-glow">
            <h3 className="text-2xl font-semibold mb-8">Order Summary</h3>

            <div className="flex justify-between mb-4 text-gray-400">
              <span>Total Items</span>
              <span>{cart.length}</span>
            </div>

            <div className="flex justify-between text-2xl font-bold mb-10">
              <span>Total Amount</span>
              <span className="text-netflixRed">
                ₹{total.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-netflixRed py-4 rounded-2xl 
                         hover:bg-red-700 transition 
                         font-semibold shadow-glow 
                         text-lg tracking-wide"
            >
              Secure Payment
            </button>

            <p className="text-xs text-gray-500 mt-6 text-center">
              100% Secure payment powered by Razorpay
            </p>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
};

export default Checkout;