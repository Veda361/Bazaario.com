import React, { useEffect, useState } from "react";
import { auth } from "../firebase";

const AdminRefunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.error("User not logged in");
      return;
    }

    const token = await user.getIdToken(true);

    const res = await fetch(
      "http://localhost:8000/api/payment/admin/refund-requests",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("API Error:", data);
      alert(data.detail);
      return;
    }

    console.log("Refund data:", data);
    setRefunds(data);
  } catch (err) {
    console.error("Fetch refund error:", err);
  }
};

  const approveRefund = async (orderId) => {
    try {
      setLoadingId(orderId);

      const token = await auth.currentUser.getIdToken();

      const res = await fetch(
        `http://localhost:8000/api/payment/admin/approve-refund/${orderId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail);
        return;
      }

      alert("Refund Approved");
      fetchRefunds();
    } catch (err) {
      alert("Approval failed");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h2 className="text-3xl font-bold mb-8">💰 Refund Requests</h2>

      {refunds.length === 0 ? (
        <p>No refund requests</p>
      ) : (
        refunds.map((order) => (
          <div
            key={order.id}
            className="bg-white p-6 rounded-xl shadow-lg mb-6"
          >
            <p><strong>Order:</strong> #{order.id}</p>
            <p><strong>User:</strong> {order.user_email}</p>
            <p><strong>Amount:</strong> ₹ {order.amount}</p>
            <p><strong>Reason:</strong> {order.reason}</p>

            <button
              onClick={() => approveRefund(order.id)}
              disabled={loadingId === order.id}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {loadingId === order.id ? "Processing..." : "Approve Refund"}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminRefunds;