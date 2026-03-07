import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const token = await auth.currentUser.getIdToken();
      let url = "http://localhost:8000/api/payment/admin/dashboard";

      if (startDate && endDate) {
        url += `?start_date=${startDate}&end_date=${endDate}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Unauthorized");

      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error(error);
      alert("You are not authorized to access admin panel");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      let url = "http://localhost:8000/api/payment/admin/export-payments";

      if (startDate && endDate) {
        url += `?start_date=${startDate}&end_date=${endDate}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "payments.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error(error);
      alert("Failed to export CSV");
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-netflixBlack flex items-center justify-center">
        <p className="text-xl text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-netflixBlack flex items-center justify-center">
        <p className="text-xl text-gray-400">No data available</p>
      </div>
    );
  }

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-netflixBlack p-12">

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-12"
      >
        📊 Bazaario Analytics Dashboard
      </motion.h1>

      {/* FILTER PANEL */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-12 flex gap-6 flex-wrap">

        <div>
          <label className="block text-sm mb-2 text-gray-400">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-black border border-gray-700 rounded-xl px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm mb-2 text-gray-400">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-black border border-gray-700 rounded-xl px-4 py-2"
          />
        </div>

        <div className="flex items-end gap-4">
          <button
            onClick={fetchDashboard}
            className="bg-netflixRed px-6 py-2 rounded-xl hover:bg-red-700 shadow-glow transition"
          >
            Apply
          </button>

          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              fetchDashboard();
            }}
            className="bg-white/10 px-6 py-2 rounded-xl border border-white/20 hover:bg-white/20 transition"
          >
            Reset
          </button>

          <button
            onClick={handleExport}
            className="bg-green-600 px-6 py-2 rounded-xl hover:bg-green-700 transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* ANALYTICS CARDS */}
      <div className="grid md:grid-cols-4 gap-8 mb-16">

        <StatCard title="Total Revenue" value={formatCurrency(data.total_revenue)} highlight />
        <StatCard title="Monthly Revenue" value={formatCurrency(data.monthly_revenue)} />
        <StatCard title="Today's Revenue" value={formatCurrency(data.today_revenue)} />
        <StatCard title="Avg Order Value" value={formatCurrency(data.avg_order_value)} />

        <StatCard title="Successful Payments" value={data.total_success} />
        <StatCard title="Failed Payments" value={data.total_failed} />
        <StatCard title="Total Orders" value={data.total_orders} />
        <StatCard title="Total Users" value={data.total_users} />

        <StatCard title="Resale Listed" value={data.total_resale_listed} />
        <StatCard title="Resale Sold" value={data.total_resale_sold} />

      </div>

      {/* TABLE */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">

        <table className="w-full text-left">
          <thead className="bg-white/10">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Method</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>

          <tbody>
            {(data.latest_payments || []).map((p) => (
              <tr
                key={p.id}
                className="border-b border-white/5 hover:bg-white/5 transition"
              >
                <td className="p-4">{p.id}</td>
                <td className="p-4">{formatCurrency(p.amount)}</td>
                <td className="p-4">{p.status}</td>
                <td className="p-4">{p.method || "-"}</td>
                <td className="p-4">
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

const StatCard = ({ title, value, highlight }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={`bg-white/5 backdrop-blur-xl border border-white/10 
                rounded-2xl p-6 transition
                ${highlight ? "shadow-glow border-netflixRed" : ""}`}
  >
    <h2 className="text-gray-400 text-sm mb-2">{title}</h2>
    <p className={`text-2xl font-bold ${highlight ? "text-netflixRed" : ""}`}>
      {value}
    </p>
  </motion.div>
);

export default AdminDashboard;