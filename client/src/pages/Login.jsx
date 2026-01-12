import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", { 
        email, 
        password 
      });
      
      console.log("Login successful:", response.data);
      
      // Force navigation to /gigs
      window.location.href = "/gigs"; // Use this instead of navigate
      
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="bg-[#1f242d] p-8 rounded-2xl w-[420px]">
        <h1 className="text-3xl font-semibold mb-8 text-center text-text">
          Welcome to <span className="text-accent">GigFlow</span>
        </h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Email */}
          <input
            className="w-full bg-[#222831] text-text p-4 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-accent"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password with show/hide */}
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full bg-[#222831] text-text p-4 rounded-xl pr-12 outline-none focus:ring-2 focus:ring-accent"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-bg font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 mt-6"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Sign up */}
        <p className="text-center mt-6 text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}