import React, { useEffect, useState } from "react";
import { auth } from "../firebase";

const API_BASE = "https://bazaario-com.onrender.com/api/payment";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = await auth.currentUser.getIdToken();

      const res = await fetch(`${API_BASE}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setOrders(data || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateShipping = async (orderId, newStatus) => {
    try {
      setLoadingId(orderId);

      const token = await auth.currentUser.getIdToken();

      await fetch(
        `${API_BASE}/admin/update-shipping/${orderId}?new_status=${newStatus}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchOrders();

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflixBlack text-white p-10">
      <h2 className="text-3xl font-bold mb-8">📦 Admin Orders</h2>

      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white/5 p-6 rounded-xl mb-6 border border-white/10"
        >
          <p className="font-bold">Order #{order.id}</p>
          <p>User: {order.user_email}</p>
          <p>Amount: ₹{order.amount}</p>

          <div className="flex gap-4 mt-4">

            <select
              value={order.shipping_status}
              onChange={(e) =>
                updateShipping(order.id, e.target.value)
              }
              className="bg-black border border-white/20 p-2 rounded"
            >
              <option>Processing</option>
              <option>Shipped</option>
              <option>Out for Delivery</option>
              <option>Delivered</option>
            </select>

            {loadingId === order.id && (
              <span>Updating...</span>
            )}

          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminOrders;