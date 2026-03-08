import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const BASE_URL = "https://bazaario-com.onrender.com/api";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [resaleHistory, setResaleHistory] = useState([]);
  const [loadingCancelId, setLoadingCancelId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const token = await auth.currentUser.getIdToken(true);

      const orderRes = await fetch(`${BASE_URL}/profile/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const orderData = await orderRes.json();
      setOrders(orderData.orders || []);

      const resaleRes = await fetch(`${BASE_URL}/resale/user/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const resaleData = await resaleRes.json();
      setResaleHistory(resaleData || []);
    } catch (err) {
      console.error("Failed to load history");
    }
  };

  const handleCancel = async (orderId) => {
    try {
      setLoadingCancelId(orderId);

      const token = await auth.currentUser.getIdToken(true);

      const res = await fetch(`${BASE_URL}/profile/order/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.detail || "Cancel failed");
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: "Cancelled" } : order
        )
      );

      alert("Order cancelled successfully");
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoadingCancelId(null);
    }
  };

  return (
    <div className="min-h-screen bg-netflixBlack text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">

        {/* ================= ORDER HISTORY ================= */}

        <h2 className="text-4xl font-extrabold mb-10 tracking-wide">
          Your Orders
        </h2>

        {orders.length === 0 ? (
          <p className="text-gray-400">No orders found.</p>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-netflixDark border-2 border-neutral-800 hover:border-netflixRed
                p-6 rounded-xl transition transform hover:scale-[1.01]"
              >
                <div className="flex justify-between items-start flex-wrap gap-4">

                  <div>
                    <p className="text-sm text-gray-400">Order ID</p>
                    <p className="text-lg font-bold">#{order.id}</p>
                  </div>

                  <div className="flex gap-3 flex-wrap">

                    <span className="px-3 py-1 text-xs rounded-full bg-green-600/20 text-green-400 border border-green-500">
                      Payment: {order.status}
                    </span>

                    {order.shipping_status && (
                      <span className="px-3 py-1 text-xs rounded-full bg-blue-600/20 text-blue-400 border border-blue-500">
                        Delivery: {order.shipping_status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between mt-6 items-center">
                  <span className="text-gray-400">Total</span>
                  <span className="text-xl font-bold text-netflixRed">
                    ₹ {order.amount?.toLocaleString("en-IN")}
                  </span>
                </div>

                {order.estimated_delivery && (
                  <p className="text-sm text-gray-400 mt-2">
                    Expected Delivery:{" "}
                    {new Date(order.estimated_delivery).toLocaleDateString()}
                  </p>
                )}

                <div className="flex gap-4 mt-6">

                  <button
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="px-4 py-2 border border-white hover:bg-white hover:text-black transition"
                  >
                    View Details
                  </button>

                  {order.status === "Pending" && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={loadingCancelId === order.id}
                      className="px-4 py-2 bg-netflixRed hover:bg-red-700 transition font-semibold"
                    >
                      {loadingCancelId === order.id ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= RESALE HISTORY ================= */}

        <h2 className="text-4xl font-extrabold mt-16 mb-10 tracking-wide">
          Resale Requests
        </h2>

        {resaleHistory.length === 0 ? (
          <p className="text-gray-400">No resale requests found.</p>
        ) : (
          <div className="grid gap-6">
            {resaleHistory.map((item) => (
              <div
                key={item.id}
                className="bg-netflixDark border-2 border-neutral-800 hover:border-netflixRed
                p-6 rounded-xl transition transform hover:scale-[1.01]"
              >
                <div className="flex justify-between items-center flex-wrap gap-4">

                  <div>
                    <h3 className="font-bold text-lg">{item.title}</h3>

                    <p className="text-gray-400 text-sm">
                      Expected: ₹{item.expected_price}
                    </p>

                    {item.admin_price && (
                      <p className="text-gray-400 text-sm">
                        Approved: ₹{item.admin_price}
                      </p>
                    )}
                  </div>

                  <span
                    className={`px-3 py-1 text-xs border rounded-full ${
                      item.status === "Approved"
                        ? "border-green-500 text-green-400 bg-green-600/20"
                        : item.status === "Rejected"
                        ? "border-red-500 text-red-400 bg-red-600/20"
                        : "border-yellow-500 text-yellow-400 bg-yellow-600/20"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default OrderHistory;