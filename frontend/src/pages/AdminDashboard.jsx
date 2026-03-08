import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiRequest } from "../api";

const AdminDashboard = () => {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      let endpoint = "/payment/admin/dashboard";

      if (startDate && endDate) {
        endpoint += `?start_date=${startDate}&end_date=${endDate}`;
      }

      const result = await apiRequest(endpoint);

      setData(result);

    } catch (error) {
      console.error(error);
      alert("Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {

      let url = "https://bazaario-com.onrender.com/api/payment/admin/export-payments";

      if (startDate && endDate) {
        url += `?start_date=${startDate}&end_date=${endDate}`;
      }

      const token = await (await import("../firebase")).auth.currentUser.getIdToken();

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blob = await res.blob();

      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "payments.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();

    } catch (error) {
      console.error(error);
      alert("CSV export failed");
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-netflixBlack flex items-center justify-center text-white">
        Loading dashboard...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-netflixBlack flex items-center justify-center text-white">
        No data available
      </div>
    );
  }

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-netflixBlack p-12 text-white">

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-black mb-12 border-b-4 border-white pb-4"
      >
        📊 Bazaario Admin Analytics
      </motion.h1>

      {/* FILTER PANEL */}
      <div className="border-4 border-white bg-netflixDark p-6 mb-12 shadow-[8px_8px_0px_#E50914] flex flex-wrap gap-6">

        <input
          type="date"
          value={startDate}
          onChange={(e)=>setStartDate(e.target.value)}
          className="bg-black border-4 border-white px-4 py-2"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e)=>setEndDate(e.target.value)}
          className="bg-black border-4 border-white px-4 py-2"
        />

        <button
          onClick={fetchDashboard}
          className="bg-netflixRed border-4 border-white px-6 py-2 font-bold shadow-[4px_4px_0px_#000]"
        >
          Apply
        </button>

        <button
          onClick={()=>{
            setStartDate("");
            setEndDate("");
            fetchDashboard();
          }}
          className="bg-black border-4 border-white px-6 py-2 font-bold"
        >
          Reset
        </button>

        <button
          onClick={handleExport}
          className="bg-green-600 border-4 border-white px-6 py-2 font-bold"
        >
          Export CSV
        </button>

      </div>

      {/* ANALYTICS */}
      <div className="grid md:grid-cols-4 gap-8 mb-16">

        <StatCard title="Total Revenue" value={formatCurrency(data.total_revenue)} highlight />
        <StatCard title="Monthly Revenue" value={formatCurrency(data.monthly_revenue)} />
        <StatCard title="Today's Revenue" value={formatCurrency(data.today_revenue)} />
        <StatCard title="Avg Order Value" value={formatCurrency(data.avg_order_value)} />

        <StatCard title="Successful Payments" value={data.total_success} />
        <StatCard title="Failed Payments" value={data.total_failed} />
        <StatCard title="Total Orders" value={data.total_orders} />
        <StatCard title="Total Users" value={data.total_users} />

      </div>

      {/* TABLE */}
      <div className="border-4 border-white bg-netflixDark shadow-[8px_8px_0px_#E50914] overflow-hidden">

        <table className="w-full text-left">

          <thead className="border-b-4 border-white">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Method</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>

          <tbody>
            {(data.latest_payments || []).map((p)=>(
              <tr key={p.id} className="border-b border-white/10">
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
    className={`border-4 border-white p-6 bg-netflixDark shadow-[6px_6px_0px_#E50914] ${
      highlight ? "text-netflixRed" : ""
    }`}
  >
    <h2 className="text-sm mb-2 uppercase">{title}</h2>
    <p className="text-2xl font-black">{value}</p>
  </motion.div>
);

export default AdminDashboard;