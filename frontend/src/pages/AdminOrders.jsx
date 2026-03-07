import React, { useEffect, useState } from "react";
import { auth } from "../firebase";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await auth.currentUser.getIdToken();

      const res = await fetch(
        "http://localhost:8000/api/payment/admin/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch orders");

      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateShipping = async (orderId, newStatus) => {
    try {
      setLoadingId(orderId);

      const token = await auth.currentUser.getIdToken();

      const res = await fetch(
        `http://localhost:8000/api/payment/admin/update-shipping/${orderId}?new_status=${newStatus}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Update failed");
        return;
      }

      await fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h2 className="text-3xl font-bold mb-8">📦 Admin Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-6 rounded-xl shadow-lg mb-6"
          >
            <div className="grid md:grid-cols-2 gap-4 mb-4">

              {/* LEFT SIDE */}
              <div>
                <p className="font-semibold text-lg">
                  Order #{order.id}
                </p>

                <p className="text-sm text-gray-500">
                  User: {order.user_email}
                </p>

                <p className="text-sm text-gray-500">
                  Ordered On:{" "}
                  {order.created_at
                    ? new Date(order.created_at).toLocaleString()
                    : "-"}
                </p>

                <p className="text-sm mt-2">
                  Amount: ₹ {order.amount}
                </p>
              </div>

              {/* RIGHT SIDE */}
              <div className="text-sm text-right">
                <p>
                  <span className="font-medium">Payment:</span>{" "}
                  {order.status}
                </p>

                <p>
                  <span className="font-medium">Shipping:</span>{" "}
                  {order.shipping_status}
                </p>

                {order.estimated_delivery && (
                  <p>
                    <span className="font-medium">
                      Estimated Delivery:
                    </span>{" "}
                    {new Date(
                      order.estimated_delivery
                    ).toLocaleDateString()}
                  </p>
                )}

                {order.return_deadline && (
                  <p className="text-orange-600">
                    <span className="font-medium">
                      Return Deadline:
                    </span>{" "}
                    {new Date(
                      order.return_deadline
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* SHIPPING UPDATE */}
            <div className="flex gap-4 items-center">
              <select
                value={order.shipping_status}
                onChange={(e) =>
                  updateShipping(order.id, e.target.value)
                }
                disabled={loadingId === order.id}
                className="border p-2 rounded"
              >
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">
                  Out for Delivery
                </option>
                <option value="Delivered">Delivered</option>
              </select>

              {loadingId === order.id && (
                <span className="text-sm text-gray-500">
                  Updating...
                </span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminOrders;