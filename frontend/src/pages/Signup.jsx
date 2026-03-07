import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const provider = new GoogleAuthProvider();

const Signup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /* HANDLE GOOGLE REDIRECT RESULT */
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);

        if (result) {
          toast.success("Google login successful 🎉", {
            position: "bottom-right",
          });

          navigate("/");
        }
      } catch (error) {
        console.error(error);

        toast.error("Google authentication failed ❌", {
          position: "bottom-right",
        });
      }
    };

    handleRedirect();
  }, [navigate]);

  /* HANDLE SIGNUP */
  const handleSignup = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);

      toast.success("Account created successfully 🎉", {
        position: "bottom-right",
      });

      navigate("/login");

    } catch (error) {

      if (error.code === "auth/email-already-in-use") {

        toast.info("Account already exists. Please login.", {
          position: "bottom-right",
        });

        navigate("/login");

      } else {

        toast.error(
          error?.message?.replace("Firebase:", "") || "Signup failed ❌",
          { position: "bottom-right" }
        );

      }
    }

    setLoading(false);
  };

  /* GOOGLE LOGIN */
  const handleGoogle = async () => {
    try {
      toast.info("Redirecting to Google login...", {
        position: "bottom-right",
      });

      await signInWithRedirect(auth, provider);

    } catch (error) {
      console.error(error);

      toast.error("Google login failed ❌", {
        position: "bottom-right",
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-netflixBlack flex items-center justify-center px-6">

      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px]
                        bg-netflixRed opacity-20 blur-3xl animate-pulse" />
      </div>

      <div className="relative w-full max-w-md">

        <div className="group transform transition duration-500 hover:-translate-y-2">

          <div className="border-4 border-white bg-netflixDark
                          shadow-[14px_14px_0px_#E50914]
                          p-10">

            <h2 className="text-4xl font-black uppercase mb-8 
                           border-b-4 border-white pb-4 tracking-wider">
              Create Account
            </h2>

            <form
              autoComplete="off"
              onSubmit={handleSignup}
              className="space-y-6"
            >

              {/* EMAIL */}
              <div>
                <label className="block text-sm mb-2 font-bold uppercase">
                  Email
                </label>

                <input
                  type="email"
                  name="user_email"
                  autoComplete="new-email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 bg-black border-4 border-white
                             focus:border-netflixRed outline-none
                             transition-all duration-300"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-sm mb-2 font-bold uppercase">
                  Password
                </label>

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    name="user_password"
                    autoComplete="new-password"
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 bg-black border-4 border-white
                               focus:border-netflixRed outline-none
                               transition-all duration-300"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm opacity-70 hover:opacity-100"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>
              </div>

              {/* SIGNUP BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 uppercase font-bold
                           border-4 border-white
                           shadow-[6px_6px_0px_#000]
                           bg-netflixRed hover:bg-red-700
                           transition-all duration-200
                           ${
                             loading
                               ? "opacity-70 cursor-not-allowed"
                               : "active:translate-x-2 active:translate-y-2 active:shadow-none"
                           }`}
              >
                {loading ? "Creating..." : "Sign Up"}
              </button>

            </form>

            {/* GOOGLE LOGIN */}
            <button
              onClick={handleGoogle}
              className="w-full mt-6 py-4 uppercase font-bold
                         border-4 border-white
                         shadow-[6px_6px_0px_#000]
                         bg-black hover:bg-gray-900
                         active:translate-x-2 active:translate-y-2 active:shadow-none
                         transition-all"
            >
              Continue with Google
            </button>

            {/* LOGIN LINK */}
            <p className="mt-8 text-sm">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="font-bold cursor-pointer underline hover:text-netflixRed"
              >
                Login
              </span>
            </p>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Signup;