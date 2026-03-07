import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-toastify";

const ForgotPassword = () => {

  const [email, setEmail] = useState("");

  const handleReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Reset email sent 📩");
    } catch (err) {
      toast.error("Failed to send reset email");
    }
  };

  return (
    <div className="min-h-screen bg-netflixBlack flex items-center justify-center">

      <div className="border-4 border-white bg-netflixDark p-10 w-96">

        <h2 className="text-3xl font-bold mb-6">Reset Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-4 bg-black border-4 border-white"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <button
          onClick={handleReset}
          className="w-full mt-6 py-4 bg-netflixRed border-4 border-white"
        >
          Send Reset Link
        </button>

      </div>

    </div>
  );
};

export default ForgotPassword;