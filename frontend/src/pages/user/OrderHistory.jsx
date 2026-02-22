import React from "react";
import { useOrders } from "../../context/OrderContext";
import { auth } from "../../firebase";

const OrderHistory = () => {
  const { orders } = useOrders();

  const userOrders = orders.filter(
    (order) => order.user === auth.currentUser?.email
  );

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">
          Order History
        </h2>

        {userOrders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          userOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-xl shadow mb-6"
            >
              <div className="flex justify-between mb-4">
                <span className="font-semibold">
                  Order ID: {order.id}
                </span>
                <span>{order.date}</span>
              </div>

              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between border-b py-2"
                >
                  <span>
                    {item.title} (x{item.quantity})
                  </span>
                  <span>
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}

              <div className="flex justify-between font-bold mt-4">
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