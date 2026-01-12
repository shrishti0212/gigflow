import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate, useParams, Link } from "react-router-dom";

export default function EditGig() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const res = await api.get(`/api/gigs/${id}`);
        const gig = res.data.gig;
        
        if (!res.data.isOwner) {
          alert("You are not authorized to edit this gig");
          navigate("/gigs");
          return;
        }

        setTitle(gig.title);
        setDescription(gig.description);
        setBudget(gig.budget);
      } catch (error) {
        alert("Error loading gig");
        navigate("/gigs");
      } finally {
        setLoading(false);
      }
    };

    fetchGig();
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!title || !description || !budget) {
      alert("All fields are required");
      return;
    }

    try {
      await api.put(`/api/gigs/${id}`, {
        title,
        description,
        budget,
      });

      alert("Gig updated successfully!");
      navigate(`/gigs/${id}`);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update gig");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-text">
      <div className="bg-[#1f242d] p-8 rounded-2xl w-[420px]">
        <h1 className="text-3xl font-semibold mb-8 text-center">
          Edit <span className="text-accent">Gig</span>
        </h1>

        <form onSubmit={handleUpdate}>
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
            type="submit"
            className="w-full bg-accent text-bg font-semibold py-3 rounded-xl hover:opacity-90 transition"
          >
            Update Gig
          </button>
        </form>

        <p className="text-center mt-6">
          <Link to={`/gigs/${id}`} className="text-accent hover:underline">
            ← Cancel
          </Link>
        </p>
      </div>
    </div>
  );
}