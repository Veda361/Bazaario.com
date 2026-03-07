import React, { useEffect, useState } from "react";
import { auth } from "../firebase";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      const token = await auth.currentUser.getIdToken();

      const res = await fetch(
        "http://localhost:8000/api/payment/admin/all-payments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setPayments(data);
    };

    fetchPayments();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">All Payments</h1>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-200">
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
              <tr key={p.id} className="border-b">
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