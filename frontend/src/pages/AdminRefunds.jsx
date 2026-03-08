import React, { useEffect, useState } from "react";
import { auth } from "../firebase";

const BASE_URL = "https://bazaario-com.onrender.com/api/payment";

const AdminRefunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      const token = await auth.currentUser.getIdToken(true);

      const res = await fetch(`${BASE_URL}/admin/refund-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setRefunds(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const approveRefund = async (orderId) => {
    try {
      setLoadingId(orderId);

      const token = await auth.currentUser.getIdToken();

      await fetch(`${BASE_URL}/admin/approve-refund/${orderId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchRefunds();
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-netflixBlack text-white p-10">
      <h2 className="text-3xl font-bold mb-8">💰 Refund Requests</h2>

      {refunds.map((order) => (
        <div
          key={order.id}
          className="bg-white/5 p-6 rounded-xl mb-6 border border-white/10"
        >
          <p>Order #{order.id}</p>
          <p>User: {order.user_email}</p>
          <p>Amount: ₹{order.amount}</p>
          <p>Reason: {order.reason}</p>

          <button
            onClick={() => approveRefund(order.id)}
            disabled={loadingId === order.id}
            className="mt-4 bg-green-600 px-4 py-2 rounded"
          >
            {loadingId === order.id ? "Processing..." : "Approve Refund"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminRefunds;