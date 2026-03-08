import { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent 📩");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const token = await userCredential.user.getIdToken();

      localStorage.setItem("authToken", token);

      // Call deployed backend
      const response = await fetch(
        "https://bazaario-com.onrender.com/api/profile/dashboard",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        toast.error("Backend authentication failed ❌");
        setLoading(false);
        return;
      }

      const data = await response.json();

      localStorage.setItem("userRole", data.role);

      toast.success("Login successful 🎉");

      navigate("/");
    } catch (err) {
      console.error(err);

      toast.error(err?.message?.replace("Firebase:", "") || "Login failed ❌");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-netflixBlack flex items-center justify-center px-6">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] 
                        bg-netflixRed opacity-20 blur-3xl animate-pulse"
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="group transform transition duration-500 hover:-translate-y-2">
          <div
            className="border-4 border-white bg-netflixDark
                          shadow-[14px_14px_0px_#E50914]
                          p-10"
          >
            <h2
              className="text-4xl font-black uppercase mb-8 
                           border-b-4 border-white pb-4 tracking-wider"
            >
              Login
            </h2>

            <form
              autoComplete="off"
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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

                {/* FORGOT PASSWORD BUTTON */}
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm underline mt-2 hover:text-netflixRed"
                >
                  Forgot Password?
                </button>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 uppercase font-bold
                           border-4 border-white
                           shadow-[6px_6px_0px_#000]
                           bg-netflixRed
                           hover:bg-red-700
                           transition-all duration-200
                           ${
                             loading
                               ? "opacity-70 cursor-not-allowed"
                               : "active:translate-x-2 active:translate-y-2 active:shadow-none"
                           }`}
              >
                {loading ? "Signing In..." : "Login"}
              </button>
            </form>

            {/* SIGNUP LINK */}
            <p className="mt-8 text-sm">
              Don’t have an account?{" "}
              <span
                onClick={() => navigate("/signup")}
                className="font-bold cursor-pointer underline hover:text-netflixRed"
              >
                Create account
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
