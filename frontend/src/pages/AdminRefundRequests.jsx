import React, { useEffect, useState } from "react";
import { auth } from "../firebase";

const BASE_URL = "http://localhost:8000/api/payment";

const SHIPPING_STATUSES = [
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const AdminManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = await auth.currentUser.getIdToken(true);

    const res = await fetch(`${BASE_URL}/admin/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setOrders(data);
  };

  const updateShipping = async (orderId, newStatus) => {
    try {
      setLoadingId(orderId);

      const token = await auth.currentUser.getIdToken(true);

      await fetch(
        `${BASE_URL}/admin/update-shipping/${orderId}?new_status=${newStatus}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchOrders();
    } catch (err) {
      alert("Update failed");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-netflixBlack text-white p-10">
      <h1 className="text-4xl font-bold mb-10">
        📦 Manage Orders
      </h1>

      <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-2xl">
        <table className="w-full text-left">
          <thead className="bg-white/10">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">User</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Shipping</th>
              <th className="p-4">Update</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                className="border-b border-white/5 hover:bg-white/5 transition"
              >
                <td className="p-4">#{o.id}</td>
                <td className="p-4">{o.user_email}</td>
                <td className="p-4">₹{o.amount}</td>
                <td className="p-4">{o.status}</td>

                <td className="p-4">
                  <select
                    defaultValue={o.shipping_status}
                    onChange={(e) =>
                      updateShipping(o.id, e.target.value)
                    }
                    className="bg-black border border-white/20 rounded-xl px-3 py-2"
                  >
                    {SHIPPING_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="p-4">
                  {loadingId === o.id && (
                    <span className="text-netflixRed">
                      Updating...
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminManageOrders;