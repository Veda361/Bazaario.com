import React from "react";
import { useOrders } from "../context/OrderContext";
import { auth } from "../firebase";

const OrderHistory = () => {
  const { orders } = useOrders();

  const userOrders = orders.filter(
    (order) => order.user === auth.currentUser?.email,
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10 transition-all duration-500 ease-in-out">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 dark:text-white">
          Order History
        </h2>

        {userOrders.length === 0 ? (
          <p className="dark:text-gray-400">No orders found.</p>
        ) : (
          userOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border hover:shadow-xl transition mb-6"
            >
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-semibold dark:text-white">
                    {order.id}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 text-sm rounded-full font-medium ${
                    order.status === "Paid"
                      ? "bg-green-100 text-green-700"
                      : order.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between border-b py-2 dark:text-gray-300"
                >
                  <span>
                    {item.title} (x{item.quantity})
                  </span>
                  <span>
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}

              <div className="flex justify-between font-bold mt-4 dark:text-yellow-400">
                <span>Total</span>
                <span>₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderHistory;