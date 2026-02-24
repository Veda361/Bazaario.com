import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
// 🔥 IMPORT THIS
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <CartProvider>
      <AuthProvider>
     <ThemeProvider>
    <WishlistProvider>
      <App />
      <Toaster position="top-right" />
    </WishlistProvider>
  </ThemeProvider>
      </AuthProvider>
    </CartProvider>
  </BrowserRouter>,
);
