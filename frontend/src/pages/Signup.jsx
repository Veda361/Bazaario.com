import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const provider = new GoogleAuthProvider();

const Signup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
 

  // 🔥 Handle Google redirect result
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log("Google login successful");
          navigate("/");
        }
      } catch (error) {
        console.error(error.message);
      }
    };

    handleRedirect();
  }, [navigate]);


  // 🔥 Email/password signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/login");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        navigate("/login");
      } else {
        alert(error.message);
      }
    }

    setLoading(false);
  };

  // 🔥 Google signup
  const handleGoogle = async () => {
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
  <div className="container">
    <div className="form_area">
      <p className="title">Create Account</p>

      <form onSubmit={handleSignup}>
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

        <button type="submit" className="btn">
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>

      <button className="btn" onClick={handleGoogle}>
        Continue with Google
      </button>

      <p>
        Already have an account?
        <span className="link" onClick={() => navigate("/login")}>
          Login
        </span>
      </p>
    </div>
  </div>
);
};

export default Signup;