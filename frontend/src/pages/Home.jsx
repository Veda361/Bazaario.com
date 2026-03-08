import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import PageWrapper from "../components/PageWrapper";
// import FloatingHeroProduct from "../components/FloatingHeroProduct";
import { toast } from "react-toastify";

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const [previewProduct, setPreviewProduct] = useState(null);
  const [tiltStyle, setTiltStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiRequest("/products?page=1&limit=20");

        console.log("Products API response:", data);

        const items = data?.items || data?.products || [];

        setProducts(items);

        toast.success("Products loaded successfully 🚀", {
          position: "top-right",
          autoClose: 2000,
        });
      } catch (error) {
        console.error(error);

        toast.error("Failed to load products ❌", {
          position: "top-right",
        });
      }
    };

    fetchProducts();
  }, []);
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("homeScroll");

    if (savedScroll) {
      window.scrollTo(0, parseInt(savedScroll));
    }
  }, []);

  useEffect(() => {
    if (!products.length) return;

    const interval = setInterval(() => {
      setFade(false);

      setTimeout(() => {
        setActiveIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
        setFade(true);
      }, 400);
    }, 7000);

    return () => clearInterval(interval);
  }, [products]);

  const activeProduct = products.length ? products[activeIndex] : null;

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

  const openProduct = (id) => {
    sessionStorage.setItem("homeScroll", window.scrollY);
    navigate(`/product/${id}`);
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-netflixBlack text-white">
        {/* ================= HERO ================= */}
        {/* ================= HERO ================= */}
        {activeProduct && (
          <div className="px-8 pt-6">
            <div
              className="relative h-[70vh] max-w-7xl mx-auto rounded-3xl overflow-hidden
      shadow-[0_30px_80px_rgba(0,0,0,0.7)]"
            >
              {/* BACKGROUND IMAGE */}
              <img
                key={activeProduct.id}
                src={activeProduct?.image_url || "/placeholder.png"}
                alt={activeProduct.title}
                className={`absolute inset-0 w-full h-full object-cover
        transition-all duration-700
        ${fade ? "opacity-100 scale-105" : "opacity-0 scale-110"}`}
              />

              {/* DARK GRADIENT FOR TEXT */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />

              {/* CONTENT */}
              <div className="relative z-10 h-full flex items-center px-16 max-w-2xl">
                <div
                  className={`transition-all duration-700
          ${fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                >
                  <span className="text-netflixRed uppercase tracking-widest text-sm font-semibold">
                    Featured Product
                  </span>

                  <h1 className="text-5xl font-extrabold mt-4 leading-tight">
                    {activeProduct.title}
                  </h1>

                  <p className="text-gray-300 mt-6 text-lg leading-relaxed line-clamp-3">
                    {activeProduct.description}
                  </p>

                  <div className="flex items-center gap-8 mt-10 flex-wrap">
                    <span className="text-4xl font-bold text-netflixRed">
                      ₹{activeProduct.price}
                    </span>

                    <button
                      onClick={() => {
                        openProduct(activeProduct.id);
                        toast.success("Opening product page 🛒");
                      }}
                      className="bg-netflixRed px-10 py-4 rounded-xl
                         hover:bg-red-700 transition-all duration-300
                         shadow-[0_0_40px_rgba(229,9,20,0.5)]
                         hover:shadow-[0_0_60px_rgba(229,9,20,0.8)]
                         hover:scale-105"
                    >
                      Shop Now
                    </button>
                  </div>

                  {/* SLIDER DOTS */}
                  <div className="flex gap-3 mt-10">
                    {products.slice(0, 6).map((_, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        className={`h-2 rounded-full cursor-pointer transition-all duration-300
                ${i === activeIndex ? "w-12 bg-netflixRed" : "w-4 bg-white/40"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="absolute bottom-0 left-0 w-full bg-white/10">
                <div key={activeIndex} className="hero-progress" />
              </div>
            </div>
          </div>
        )}
        {/* ================= TRENDING ================= */}
        <div className="px-10 pb-24 pt-16">
          <h2 className="text-3xl font-bold mb-12">Trending Now</h2>

          <div className="flex flex-wrap gap-12 justify-center">
            {products.map((p, index) => (
              <div
                key={p.id}
                onClick={() => {
                  setPreviewProduct(p);
                  toast.info("Opening product preview 👀");
                }}
                className="relative w-[300px] border-4 border-white 
                           bg-netflixDark p-6
                           shadow-[10px_10px_0px_#E50914]
                           transition-all duration-200
                           hover:-translate-x-1 hover:-translate-y-1
                           hover:shadow-[14px_14px_0px_#E50914]
                           active:translate-x-2 active:translate-y-2
                           active:shadow-none cursor-pointer
                           group overflow-hidden"
              >
                {index < 3 && (
                  <div
                    className="absolute -top-3 -right-10 rotate-45 
                  bg-netflixRed text-white text-xs 
                  font-black px-12 py-1 shadow-lg"
                  >
                    HOT
                  </div>
                )}

                <div className="border-b-2 border-white pb-4 mb-4 flex items-center gap-3">
                  <div className="bg-netflixRed px-3 py-1 font-black">₹</div>
                  <h3 className="font-black uppercase text-sm line-clamp-2">
                    {p.title}
                  </h3>
                </div>

                <div className="flex justify-center items-center mb-4 border-b-2 border-white pb-4 relative">
                  <img
                    src={p.image_url}
                    alt={p.title}
                    className="h-40 object-contain transition duration-300 group-hover:scale-110"
                  />
                </div>

                <p className="text-2xl font-extrabold text-netflixRed mb-6">
                  ₹{p.price}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openProduct(p.id);
                    toast.success("Redirecting to product page 🛒");
                  }}
                  className="w-full py-3 uppercase font-bold 
                             border-3 border-white 
                             bg-netflixRed text-white
                             shadow-[5px_5px_0px_#000]
                             transition-all duration-200
                             hover:bg-red-700
                             hover:shadow-[7px_7px_0px_#000]"
                >
                  View Product
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ================= PREVIEW MODAL ================= */}
        {previewProduct && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center
                       bg-black/80 backdrop-blur-xl"
            onClick={() => setPreviewProduct(null)}
          >
            <div
              className="relative max-w-5xl w-full p-10 rounded-3xl
                         bg-gradient-to-br from-netflixDark to-black
                         border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.9)]
                         flex gap-12 items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="relative w-1/2 flex justify-center items-center"
                onMouseMove={handleMouseMove}
                onMouseLeave={resetTilt}
              >
                <div
                  className="absolute inset-0 pointer-events-none rounded-xl"
                  style={glareStyle}
                />

                <img
                  src={previewProduct.image_url}
                  alt={previewProduct.title}
                  style={tiltStyle}
                  className="h-[420px] object-contain transition-transform duration-200"
                />
              </div>

              <div className="w-1/2">
                <h2 className="text-5xl font-extrabold mb-6">
                  {previewProduct.title}
                </h2>

                <p className="text-gray-300 mb-8 leading-relaxed">
                  {previewProduct.description}
                </p>

                <p className="text-4xl font-bold text-netflixRed mb-8">
                  ₹{previewProduct.price}
                </p>

                <button
                  onClick={() => {
                    openProduct(previewProduct.id);
                    toast.success("Opening product page 🛒");
                  }}
                  className="px-10 py-4 rounded-2xl bg-netflixRed
                             hover:bg-red-700 transition font-bold"
                >
                  View Product
                </button>
              </div>

              <button
                onClick={() => setPreviewProduct(null)}
                className="absolute top-6 right-6 text-white text-2xl"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Home;
