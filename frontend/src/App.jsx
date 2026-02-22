import { Routes, Route } from "react-router-dom";
import Login from "./pages/user/Login";
import Signup from "./pages/user/Signup";
import Home from "./pages/user/Home";
import Navbar from "./components/Navbar";
import Products from "./pages/user/Products";
import ProductDetail from "./pages/user/ProductDetail";
import SearchResults from "./pages/user/SearchResults";
import Checkout from "./pages/user/Checkout";
import OrderHistory from "./pages/user/OrderHistory";
import AddProduct from "./pages/user/AddProduct";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/user/admin/AdminDashboard";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/products/:category/:subcategory" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/add-product" element={<AdminRoute>
          <AddProduct />
          </AdminRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /> </AdminRoute>} />

      </Routes>
    </>
  );
}

export default App;
