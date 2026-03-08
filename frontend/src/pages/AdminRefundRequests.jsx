import React, { useEffect, useState } from "react";
import { auth } from "../firebase";

const BASE_URL = "https://bazaario-com.onrender.com/api/payment";

const AdminRefundRequests = () => {
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

      const res = await fetch(`${BASE_URL}/admin/refund-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("API Error:", data);
        alert(data.detail || "Failed to load refunds");
        return;
      }

      setRefunds(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch refund error:", err);
    }
  };

  const approveRefund = async (orderId) => {
    try {
      setLoadingId(orderId);

      const token = await auth.currentUser.getIdToken(true);

      const res = await fetch(
        `${BASE_URL}/admin/approve-refund/${orderId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Refund approval failed");
        return;
      }

      alert("Refund Approved ✅");
      fetchRefunds();
    } catch (err) {
      console.error(err);
      alert("Approval failed");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-netflixBlack text-white p-10">
      <h2 className="text-4xl font-bold mb-10">💰 Refund Requests</h2>

      {refunds.length === 0 ? (
        <p className="text-gray-400">No refund requests</p>
      ) : (
        refunds.map((order) => (
          <div
            key={order.id}
            className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-6"
          >
            <p>
              <strong>Order:</strong> #{order.id}
            </p>

            <p>
              <strong>User:</strong> {order.user_email}
            </p>

            <p>
              <strong>Amount:</strong> ₹ {order.amount}
            </p>

            <p>
              <strong>Reason:</strong> {order.reason}
            </p>

            <button
              onClick={() => approveRefund(order.id)}
              disabled={loadingId === order.id}
              className="mt-4 bg-netflixRed text-white px-5 py-2 rounded-lg hover:bg-red-700 transition"
            >
              {loadingId === order.id ? "Processing..." : "Approve Refund"}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminRefundRequests;