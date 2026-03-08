import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { apiRequest } from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          // ✅ Get Firebase token
          const token = await firebaseUser.getIdToken();

          // ✅ Send token to backend
          const data = await apiRequest("/profile/dashboard", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (data && data.role) {
            setRole(data.role);
          } else {
            setRole("buyer");
          }

          console.log("Profile response:", data);
          console.log("ROLE:", data.role);

        } catch (err) {
          console.error("Auth API error:", err);
          setRole("buyer");
        }

      } else {
        setUser(null);
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);