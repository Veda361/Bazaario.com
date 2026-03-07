import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const BASE_URL = "http://localhost:8000/api";

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

      // ================= FETCH ORDERS =================
      const orderRes = await fetch(
        `${BASE_URL}/profile/dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const orderData = await orderRes.json();
      setOrders(orderData.orders || []);

      // ================= FETCH RESALE HISTORY =================
      const resaleRes = await fetch(
        `${BASE_URL}/resale/user/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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

      const res = await fetch(
        `${BASE_URL}/profile/order/${orderId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const error = await res.json();
        alert(error.detail || "Cancel failed");
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: "Cancelled" }
            : order
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
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-5xl mx-auto">

        {/* ================= ORDER HISTORY ================= */}
        <h2 className="text-3xl font-bold mb-8">
          Order History
        </h2>

        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-xl shadow-lg mb-6"
            >
              <div className="flex justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-semibold">#{order.id}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                    Payment: {order.status}
                  </span>

                  {order.shipping_status && (
                    <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                      Delivery: {order.shipping_status}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between font-bold mt-4">
                <span>Total</span>
                <span>
                  ₹ {order.amount?.toLocaleString("en-IN")}
                </span>
              </div>

              {order.estimated_delivery && (
                <p className="mt-2 text-sm text-gray-500">
                  Expected Delivery:{" "}
                  {new Date(order.estimated_delivery).toLocaleDateString()}
                </p>
              )}

              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="text-blue-600 underline"
                >
                  View Details
                </button>

                {order.status === "Pending" && (
                  <button
                    onClick={() => handleCancel(order.id)}
                    disabled={loadingCancelId === order.id}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {/* ================= RESALE HISTORY ================= */}
        <h2 className="text-3xl font-bold mt-12 mb-8">
          Resale Request History
        </h2>

        {resaleHistory.length === 0 ? (
          <p>No resale requests found.</p>
        ) : (
          resaleHistory.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-xl shadow-lg mb-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Expected: ₹{item.expected_price}
                  </p>

                  {item.admin_price && (
                    <p className="text-sm text-gray-500">
                      Approved Price: ₹{item.admin_price}
                    </p>
                  )}
                </div>

                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    item.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : item.status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))
        )}

      </div>
    </div>
  );
};

export default OrderHistory;