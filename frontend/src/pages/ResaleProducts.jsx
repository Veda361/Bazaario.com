import { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { getAuth } from "firebase/auth";

const ResaleProducts = () => {
  const [products, setProducts] = useState([]);
  const auth = getAuth();

  const fetchProducts = async () => {
    const res = await fetch("https://bazaario-com.onrender.com/api/resale/");
    const data = await res.json();
    setProducts(data);
  };

  const handleBuyNow = async (product) => {
    try {
      const token = await auth.currentUser.getIdToken();

      const res = await fetch(
        "https://bazaario-com.onrender.com/api/payment/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            resale_product_id: product.id,
          }),
        },
      );

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Order creation failed");
        return;
      }

      const order = await res.json();

      const options = {
        key: "rzp_test_SKGdWUi6rOlRrn",
        amount: order.amount,
        currency: "INR",
        name: "Bazaario",
        description: product.title,
        order_id: order.id,
        handler: async function () {
          alert("Payment Successful!");
          window.location.reload();
        },
        theme: {
          color: "#E50914",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-netflixBlack px-10 py-14">
        <h1 className="text-4xl font-bold mb-12">Refurbished & Second-Hand</h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-netflixDark rounded-2xl overflow-hidden 
                         hover:scale-105 transition-all duration-500 
                         hover:shadow-glow"
            >
              <div className="h-56 flex items-center justify-center bg-black">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="h-48 object-contain"
                />
              </div>

              <div className="p-6">
                <h3 className="font-semibold mb-2">{product.title}</h3>

                <p className="text-gray-400 text-sm mb-3">
                  Condition: {product.condition}
                </p>

                <p className="text-netflixRed text-xl font-bold mb-5">
                  ₹{Number(product.admin_price).toLocaleString("en-IN")}
                </p>

                <button
                  onClick={() => handleBuyNow(product)}
                  className="w-full bg-netflixRed py-3 rounded-xl 
                             hover:bg-red-700 transition shadow-glow"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default ResaleProducts;
