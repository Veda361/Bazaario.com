import React, { createContext, useContext, useState } from "react";
import { useCart } from "./CartContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const { cart, setCart } = useCart();

  // 🔥 PLACE ORDER (After Payment Verified)
  const placeOrder = async (userEmail, paymentId) => {
    if (cart.length === 0) return;

    try {
      const totalAmount = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      const newOrder = {
        items: cart,
        total: totalAmount,
        user: userEmail,
        paymentId: paymentId,
        status: "Paid", // Can be: Pending, Paid, Shipped, Delivered
        createdAt: serverTimestamp(),
      };

      // 🔥 Save to Firestore
      const docRef = await addDoc(collection(db, "orders"), newOrder);

      // 🔥 Add to local state for instant UI update
      setOrders((prev) => [
        { id: docRef.id, ...newOrder },
        ...prev,
      ]);

      // 🔥 Clear cart after successful save
      setCart([]);
    } catch (error) {
      console.error("Order save failed:", error);
      alert("Failed to save order");
    }
  };

  return (
    <OrderContext.Provider value={{ orders, placeOrder }}>
      {children}
    </OrderContext.Provider>
  );
};