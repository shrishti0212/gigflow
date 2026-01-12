import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";
import socket from "../socket";

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        //login check
        const res = await api.get("/api/auth/me");
        setIsAuthenticated(true);

        socket.connect();

        socket.emit("join", res.data.id);

        // 4️⃣ Listen for hire notification
        socket.on("hired", (data) => {
          alert(data.message);

          // Optional but recommended
          window.location.href = "/gigs";
        });

      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    return () => {
      socket.off("hired");
    };
  }, []);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated
  return children;
}