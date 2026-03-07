import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ThemeProvider } from "./context/ThemeContext";
// import { OrderProvider } from "./context/OrderContext.jsx"; // ✅ ADD THIS
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
            {/* ✅ WRAP HERE */}
            <WishlistProvider>
              <App />
              <Toaster position="top-right" />
            </WishlistProvider>
          
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
);