import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Register
      await api.post("/api/auth/register", {
        name,
        email,
        password,
      });

      // Auto-login after register
      await api.post("/api/auth/login", {
        email,
        password,
      });

      console.log("Registration and login successful");
      navigate("/gigs");
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="bg-[#1f242d] p-8 rounded-2xl w-[420px]">
        <h1 className="text-3xl font-semibold mb-8 text-center text-text">
          Create your <span className="text-accent">GigFlow</span> account
        </h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          {/* Name */}
          <input
            className="w-full bg-[#222831] text-text p-4 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-accent"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* Email */}
          <input
            className="w-full bg-[#222831] text-text p-4 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-accent"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
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

          {/* Confirm Password */}
          <div className="relative mb-4">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="w-full bg-[#222831] text-text p-4 rounded-xl pr-12 outline-none focus:ring-2 focus:ring-accent"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent"
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Register button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-bg font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center mt-6 text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}