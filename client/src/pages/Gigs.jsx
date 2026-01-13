import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

export default function Gigs() {
  const [myGigs, setMyGigs] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [availableGigs, setAvailableGigs] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // ✅ NEW
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGigs();
  }, [searchQuery]); // ✅ Re-fetch when search changes

  const fetchGigs = async () => {
    try {
      const [myGigsRes, myBidsRes, availableGigsRes] = await Promise.all([
        api.get("/api/gigs/my"),
        api.get("/api/bids/my"),
        // ✅ Add search query parameter
        api.get(`/api/gigs/available${searchQuery ? `?search=${searchQuery}` : ""}`),
      ]);
      
      setMyGigs(myGigsRes.data);
      setMyBids(myBidsRes.data);
      setAvailableGigs(availableGigsRes.data);
    } catch (error) {
      console.error("Error fetching gigs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleDelete = async (gigId) => {
    if (!confirm("Are you sure you want to delete this gig?")) return;

    try {
      await api.delete(`/api/gigs/${gigId}`);
      setMyGigs(myGigs.filter((g) => g._id !== gigId));
      alert("Gig deleted successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete gig");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p>Loading gigs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Navbar */}
      <nav className="bg-[#1f242d] p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Gig<span className="text-accent">Flow</span>
        </h1>
        <div className="flex gap-4">
          <Link
            to="/create"
            className="bg-accent text-bg px-4 py-2 rounded-xl font-semibold hover:opacity-90"
          >
            + Create Gig
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="p-8 space-y-12">
        {/* MY GIGS SECTION */}
        <section>
          <h2 className="text-2xl font-bold text-accent mb-4">My Gigs</h2>
          {myGigs.length === 0 ? (
            <div className="bg-[#1f242d] p-8 rounded-xl text-center">
              <p className="text-gray-400 mb-4">You haven't created any gigs yet.</p>
              <Link
                to="/create"
                className="inline-block bg-accent text-bg px-6 py-3 rounded-xl font-semibold hover:opacity-90"
              >
                Create Your First Gig
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {myGigs.map((gig) => (
                <div
                  key={gig._id}
                  className="bg-[#1f242d] p-5 rounded-xl border border-accent/20 hover:border-accent/50 transition"
                >
                  <h3 className="text-xl font-semibold">{gig.title}</h3>
                  <p className="text-gray-400 mt-2 line-clamp-2">{gig.description}</p>
                  <p className="text-accent mt-3 font-bold">₹{gig.budget}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Status: <span className={gig.status === "open" ? "text-green-400" : "text-yellow-400"}>{gig.status}</span>
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Link to={`/gigs/${gig._id}`} className="flex-1 text-center bg-accent text-bg py-2 rounded-xl font-semibold hover:opacity-90">
                      View Bids
                    </Link>
                    <Link to={`/edit/${gig._id}`} className="flex-1 text-center bg-blue-600 text-white py-2 rounded-xl font-semibold hover:opacity-90">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(gig._id)} className="flex-1 bg-red-600 text-white py-2 rounded-xl font-semibold hover:opacity-90">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* MY BIDS SECTION */}
        <section>
          <h2 className="text-2xl font-bold text-accent mb-4">My Bids</h2>
          {myBids.length === 0 ? (
            <div className="bg-[#1f242d] p-8 rounded-xl text-center">
              <p className="text-gray-400">You haven't placed any bids yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {myBids.map((bid) => (
                <div key={bid._id} className="bg-[#1f242d] p-5 rounded-xl border border-accent/20 hover:border-accent/50 transition">
                  <h3 className="text-xl font-semibold">{bid.gigId?.title || "Deleted Gig"}</h3>
                  <p className="text-accent mt-2 font-bold">Your Bid: ₹{bid.price}</p>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{bid.message}</p>
                  <p className="text-sm mt-2">
                    Status: <span className={bid.status === "hired" ? "text-green-400" : bid.status === "rejected" ? "text-red-400" : "text-yellow-400"}>{bid.status}</span>
                  </p>
                  {bid.gigId && (
                    <Link to={`/gigs/${bid.gigId._id}`} className="inline-block mt-4 text-accent hover:underline">
                      View Project →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ✅ AVAILABLE GIGS WITH SEARCH */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-accent">Available Gigs</h2>
            
            {/* ✅ SEARCH BAR */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search gigs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1f242d] text-text px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-accent w-64"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {availableGigs.length === 0 ? (
            <div className="bg-[#1f242d] p-8 rounded-xl text-center">
              <p className="text-gray-400">
                {searchQuery ? `No gigs found for "${searchQuery}"` : "No gigs available right now."}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {availableGigs.map((gig) => (
                <div key={gig._id} className="bg-[#1f242d] p-5 rounded-xl border border-accent/20 hover:border-accent/50 transition">
                  <h3 className="text-xl font-semibold">{gig.title}</h3>
                  <p className="text-gray-400 mt-2 line-clamp-2">{gig.description}</p>
                  <p className="text-accent mt-3 font-bold">₹{gig.budget}</p>
                  <Link to={`/gigs/${gig._id}`} className="inline-block mt-4 text-accent hover:underline">
                    View & Bid →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}