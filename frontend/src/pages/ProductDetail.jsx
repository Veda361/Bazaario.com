import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { apiRequest } from "../api";
import { useWishlist } from "../context/WishlistContext";
import PageWrapper from "../components/PageWrapper";
import { toast } from "react-toastify";
import RelatedProducts from "../components/RelatedProducts";
import ProductReviews from "../components/ProductReviews";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { wishlist = [], toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [tiltStyle, setTiltStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await apiRequest(`/products/${id}`);
        setProduct(data);

        toast.success("Product loaded successfully 🛍️", {
          position: "bottom-right",
        });
      } catch (error) {
        console.error("Failed to load product", error);

        toast.error("Failed to load product ❌", {
          position: "bottom-right",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -(y - centerY) / 18;
    const rotateY = (x - centerX) / 18;

    setTiltStyle({
      transform: `perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.06,1.06,1.06)`,
    });

    setGlareStyle({
      background: `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.35), transparent 60%)`,
    });
  };

  const resetTilt = () => {
    setTiltStyle({
      transform: "perspective(1400px) rotateX(0deg) rotateY(0deg)",
    });

    setGlareStyle({});
  };

  const isWishlisted = wishlist.find((item) => item.id === product?.id);

  const goBackToProducts = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-netflixBlack text-white">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-netflixBlack text-netflixRed">
        Product not found
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-netflixBlack p-10 pt-28 text-white flex justify-center">
        <div className="w-full max-w-6xl perspective-[1200px]">
          {/* BACK BUTTON */}
          <button
            onClick={goBackToProducts}
            className="mb-6 px-6 py-3 bg-netflixRed font-bold border-4 border-white shadow-[6px_6px_0px_#000] hover:bg-red-700"
          >
            ← Back
          </button>

          <div
            className="relative group border-4 border-white
             bg-netflixDark p-10
             shadow-[25px_25px_0px_#E50914]
             transition-all duration-500
             hover:translate-x-4 hover:translate-y-4
             hover:rotate-[1deg]
             hover:shadow-[45px_45px_0px_#E50914]
             transform-gpu"
          >
            {/* BACKGROUND EFFECT */}
            <div
              className="absolute inset-0 -z-10 rounded-lg 
              before:absolute before:inset-0 before:bg-netflixRed/20 
              before:translate-x-6 before:translate-y-6 
              before:rounded-lg
              after:absolute after:inset-0 after:bg-white/5
              after:-translate-x-6 after:-translate-y-6
              after:rounded-lg
              transition-all duration-500
              group-hover:before:translate-x-10
              group-hover:before:translate-y-10
              group-hover:after:-translate-x-10
              group-hover:after:-translate-y-10"
            />

            <div className="grid md:grid-cols-2 gap-12 relative z-10">
              {/* IMAGE */}
              <div
                className="flex justify-center items-center border-b-2 md:border-b-0 md:border-r-2 border-white pb-6 md:pb-0 md:pr-6 relative"
                onMouseMove={handleMouseMove}
                onMouseLeave={resetTilt}
              >
                <div
                  className="absolute inset-0 pointer-events-none rounded-xl"
                  style={glareStyle}
                />

                <img
                  src={product.image_url}
                  alt={product.title}
                  style={tiltStyle}
                  className="h-96 object-contain transition-transform duration-200"
                />
              </div>

              {/* DETAILS */}
              <div>
                <h1 className="text-4xl font-black uppercase mb-6 border-b-2 border-white pb-4">
                  {product.title}
                </h1>

                <p className="text-4xl font-extrabold text-netflixRed mb-6">
                  ₹{product.price?.toLocaleString()}
                </p>

                <p className="text-gray-300 mb-8 border-b-2 border-white pb-6">
                  {product.description}
                </p>

                <p className="mb-8 font-semibold">
                  {product.stock > 0
                    ? `In Stock (${product.stock} available)`
                    : "Out of Stock"}
                </p>

                {/* ACTIONS */}
                <div className="flex gap-4 flex-wrap">
                  {/* ADD TO CART */}
                  <button
                    disabled={product.stock === 0}
                    onClick={() => {
                      addToCart(product);

                      toast.success("Added to cart 🛒", {
                        position: "bottom-right",
                      });
                    }}
                    className={`flex-1 py-4 uppercase font-bold 
                      border-4 border-white
                      shadow-[8px_8px_0px_#000]
                      transition-all duration-200
                      ${
                        product.stock === 0
                          ? "bg-gray-600 cursor-not-allowed"
                          : "bg-netflixRed hover:bg-red-700 active:translate-x-2 active:translate-y-2 active:shadow-none"
                      }`}
                  >
                    Add to Cart
                  </button>

                  {/* BUY NOW */}
                  <button
                    disabled={product.stock === 0}
                    onClick={() => {
                      addToCart(product);

                      toast.success("Redirecting to checkout ⚡", {
                        position: "bottom-right",
                      });

                      navigate("/checkout");
                    }}
                    className={`flex-1 py-4 uppercase font-bold 
                      border-4 border-white
                      shadow-[8px_8px_0px_#000]
                      transition-all duration-200
                      ${
                        product.stock === 0
                          ? "bg-gray-600 cursor-not-allowed"
                          : "bg-black hover:bg-gray-900 active:translate-x-2 active:translate-y-2 active:shadow-none"
                      }`}
                  >
                    Buy Now
                  </button>

                  {/* WISHLIST */}
                  <button
                    onClick={() => {
                      toggleWishlist(product);

                      if (isWishlisted) {
                        toast.info("Removed from wishlist 💔", {
                          position: "bottom-right",
                        });
                      } else {
                        toast.success("Added to wishlist ❤️", {
                          position: "bottom-right",
                        });
                      }
                    }}
                    className={`px-6 py-4 uppercase font-bold
                      border-4 border-white
                      shadow-[8px_8px_0px_#000]
                      transition-all duration-200
                      ${
                        isWishlisted
                          ? "bg-netflixRed active:translate-x-2 active:translate-y-2 active:shadow-none"
                          : "bg-netflixDark hover:bg-gray-800 active:translate-x-2 active:translate-y-2 active:shadow-none"
                      }`}
                  >
                    ❤️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ProductReviews productId={product.id} />
      <RelatedProducts
        category={product.category}
        currentProductId={product.id}
      />
    </PageWrapper>
  );
};

export default ProductDetail;
