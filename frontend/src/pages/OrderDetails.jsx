import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auth } from "../firebase";
import PageWrapper from "../components/PageWrapper";
import { toast } from "react-toastify";

const OrderDetails = () => {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const steps = ["Processing", "Shipped", "Out for Delivery", "Delivered"];

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      if (!auth.currentUser) {
        toast.error("Please login first 🔐", { position: "bottom-right" });
        return;
      }

      const token = await auth.currentUser.getIdToken();

      const res = await fetch(
        `https://bazaario-com.onrender.com/api/payment/orders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) {
        toast.error("Failed to fetch order ❌", {
          position: "bottom-right",
        });
        setLoading(false);
        return;
      }

      const data = await res.json();
      setOrder(data);

      toast.success("Order loaded successfully 📦", {
        position: "bottom-right",
      });
    } catch (err) {
      console.error("Order fetch error:", err);

      toast.error("Something went wrong loading order ❌", {
        position: "bottom-right",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-netflixBlack text-white flex items-center justify-center text-xl font-bold">
        Loading order...
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen bg-netflixBlack text-netflixRed flex items-center justify-center text-xl font-bold">
        Order not found
      </div>
    );

  const currentIndex = steps.indexOf(order.shipping_status);

  const progress =
    currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;

  return (
    <PageWrapper>
      <div className="min-h-screen bg-netflixBlack px-8 py-16 text-white flex justify-center">
        <div
          className="w-full max-w-5xl border-4 border-white
          bg-netflixDark p-10
          shadow-[20px_20px_0px_#E50914]"
        >
          {/* HEADER */}
          <h2 className="text-4xl font-black mb-2">ORDER #{order.id}</h2>

          <p className="text-2xl font-bold text-netflixRed mb-6">
            ₹ {Number(order.amount).toLocaleString("en-IN")}
          </p>

          {/* PAYMENT STATUS */}
          <div className="mb-3 font-semibold">
            Payment Status:
            <span className="ml-2 text-netflixRed">{order.status}</span>
          </div>

          {/* SHIPPING STATUS */}
          <div className="mb-8 font-semibold">
            Shipping Status:
            <span className="ml-2 text-green-400">{order.shipping_status}</span>
          </div>

          {/* REFUND STATUS */}
          {order.status === "Refund Requested" && (
            <div
              className="mb-6 border-4 border-yellow-400
              bg-yellow-200 text-black p-4 font-bold"
            >
              ⏳ Refund Requested (Waiting for admin approval)
            </div>
          )}

          {order.is_refunded && (
            <div
              className="mb-6 border-4 border-green-400
              bg-green-200 text-black p-4 font-bold"
            >
              💰 Refunded Successfully
            </div>
          )}

          {/* PROGRESS BAR */}
          <div className="mb-10">
            <div className="w-full bg-white/10 h-3 border-2 border-white">
              <div
                className="bg-netflixRed h-3 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between mt-3 text-sm font-bold">
              {steps.map((step, index) => (
                <span
                  key={index}
                  className={
                    index <= currentIndex ? "text-netflixRed" : "text-gray-400"
                  }
                >
                  {step}
                </span>
              ))}
            </div>
          </div>

          {/* DELIVERY INFO */}
          {order.estimated_delivery && (
            <p className="mb-2 font-semibold">
              📦 Estimated Delivery:{" "}
              {new Date(order.estimated_delivery).toLocaleDateString()}
            </p>
          )}

          {order.delivered_at && (
            <p className="mb-4 text-green-400 font-semibold">
              ✅ Delivered on{" "}
              {new Date(order.delivered_at).toLocaleDateString()}
            </p>
          )}

          {/* ITEMS */}
          {order.items && order.items.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-black mb-4 border-b-2 border-white pb-2">
                ITEMS
              </h3>

              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between border-b border-white/20 py-3"
                >
                  <span>
                    {item.title} (x{item.quantity})
                  </span>

                  <span className="text-netflixRed font-bold">
                    ₹ {(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default OrderDetails;
