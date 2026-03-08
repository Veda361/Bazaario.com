import React, { useEffect, useState } from "react";
import { auth } from "../firebase";

const BASE_URL = "https://bazaario-com.onrender.com/api/payment";

const AdminRefundHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = await auth.currentUser.getIdToken(true);

      const res = await fetch(`${BASE_URL}/admin/refund-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setHistory(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-netflixBlack text-white p-10">
      <h1 className="text-4xl font-bold mb-10">📜 Refund History</h1>

      {history.map((r) => (
        <div
          key={r.id}
          className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-6"
        >
          <p><strong>Order:</strong> #{r.id}</p>
          <p><strong>User:</strong> {r.user_email}</p>
          <p><strong>Amount:</strong> ₹{r.amount}</p>
          <p><strong>Refund ID:</strong> {r.refund_id}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminRefundHistory;