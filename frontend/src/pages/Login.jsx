import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      // 🔐 Firebase login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 🔑 Get Firebase ID Token
      const token = await userCredential.user.getIdToken();
      localStorage.setItem("authToken", token); // Store token for later use

      // 🚀 Send token to FastAPI backend
      const response = await fetch("http://localhost:8000/protected", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Backend authentication failed");
      }

      const data = await response.json();
      console.log("Backend response:", data);
      localStorage.setItem("userRole", data.role); // Store user role in localStorage
      

      // ✅ Optional: Save token (if needed)
      localStorage.setItem("authToken", token);

      // 🔁 Redirect after success
      navigate("/");

    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <div className="form_area">
        <p className="title">Login</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <div className="form_group">
            <label className="sub_title">Email</label>
            <input
              type="email"
              required
              className="form_style"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form_group">
            <label className="sub_title">Password</label>
            <input
              type="password"
              required
              className="form_style"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p style={{ color: "red", marginTop: "10px" }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn">
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p>
          Don’t have an account?
          <span className="link" onClick={() => navigate("/signup")}>
            Create account
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;