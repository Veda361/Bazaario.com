import React, { useEffect, useState } from "react";
import { auth } from "../firebase";

const BASE_URL = "https://bazaario-com.onrender.com/api/payment";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = await auth.currentUser.getIdToken();

      const res = await fetch(`${BASE_URL}/admin/all-payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setPayments(data || []);
    } catch (err) {
      console.error("Failed to load payments", err);
    }
  };

  return (
    <div className="min-h-screen bg-netflixBlack text-white p-10">
      <h1 className="text-3xl font-bold mb-6">All Payments</h1>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/10">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">User ID</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Method</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-white/10">
                <td className="p-3">{p.id}</td>
                <td className="p-3">{p.user_id}</td>
                <td className="p-3">₹{p.amount}</td>
                <td className="p-3">{p.status}</td>
                <td className="p-3">{p.payment_method}</td>
                <td className="p-3">
                  {new Date(p.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default AdminPayments;