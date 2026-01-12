import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

export default function CreateGig() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const navigate = useNavigate();

  
  const submit = async () => {
    if (!title || !description || !budget) {
      alert("All fields are required");
      return;
    }

    try {
      await api.post("/api/gigs", {
        title,
        description,
        budget,
      });

      navigate("/gigs");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create gig");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-text">
      <div className="bg-[#1f242d] p-8 rounded-2xl w-[420px]">
        <h1 className="text-3xl font-semibold mb-8 text-center">
          Create New <span className="text-accent">Gig</span>
        </h1>

        {/* Title */}
        <input
          className="input"
          placeholder="Gig Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Description */}
        <textarea
          className="input resize-none h-28"
          placeholder="Gig Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Budget */}
        <input
          type="number"
          className="input"
          placeholder="Budget (₹)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />

        {/* Buttons */}
        <button
          onClick={submit}
          className="w-full bg-accent text-bg font-semibold py-3 rounded-xl hover:opacity-90 transition"
        >
          Create Gig
        </button>

        <p className="text-center mt-6">
          <Link to="/gigs" className="text-accent hover:underline">
            ← Back to gigs
          </Link>
        </p>
      </div>
    </div>
  );
}
