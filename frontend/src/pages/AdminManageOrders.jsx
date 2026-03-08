import React, { useEffect, useState } from "react";
import { apiRequest } from "../api";

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
    try {
      const data = await apiRequest("/payment/admin/orders");
      setOrders(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load orders");
    }
  };

  const updateShipping = async (orderId, newStatus) => {
    try {
      setLoadingId(orderId);

      await apiRequest(
        `/payment/admin/update-shipping/${orderId}?new_status=${newStatus}`,
        {
          method: "PUT",
        }
      );

      fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-netflixBlack text-white p-10">
      <h1 className="text-4xl font-black mb-10 border-b-4 border-white pb-4">
        📦 Manage Orders
      </h1>

      <div className="overflow-x-auto border-4 border-white bg-netflixDark shadow-[8px_8px_0px_#E50914]">
        <table className="w-full text-left">

          <thead className="border-b-4 border-white">
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
                className="border-b border-white/10 hover:bg-white/5 transition"
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
                    className="bg-black border-4 border-white px-3 py-2"
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
                    <span className="text-netflixRed font-bold">
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