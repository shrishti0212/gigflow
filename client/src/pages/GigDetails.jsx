import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
// import { io } from "socket.io-client";

export default function GigDetails() {
  const { id } = useParams();
  const [gig, setGig] = useState(null);
  const [bids, setBids] = useState([]);
  const [myBid, setMyBid] = useState(null); // NEW
  const [isOwner, setIsOwner] = useState(false);
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState("");

  const fetchGigAndBids = async () => {
    try {
      // Fetch gig details
      const gigRes = await api.get(`/api/gigs/${id}`);
      setGig(gigRes.data.gig);
      setIsOwner(gigRes.data.isOwner);

      // Fetch bids if owner
      if (gigRes.data.isOwner) {
        const bidsRes = await api.get(`/api/bids/gig/${id}`);
        setBids(bidsRes.data);
      } else {
        // If not owner, check if user has placed a bid
        try {
          const myBidRes = await api.get(`/api/bids/my-bid/${id}`);
          setMyBid(myBidRes.data);
        } catch (error) {
          // No bid placed yet
          setMyBid(null);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

useEffect(() => {
  fetchGigAndBids();
}, [id]);

  const placeBid = async () => {
    if (!message || !price) {
      alert("Message and price are required");
      return;
    }

    try {
      await api.post("/api/bids", { gigId: id, message, price });
      setMessage("");
      setPrice("");
      alert("Bid placed successfully!");
      fetchGigAndBids(); // Refresh to show the bid
    } catch (error) {
      alert(error.response?.data?.message || "Failed to place bid");
    }
  };

  const hire = async (bidId) => {
    try {
      await api.patch(`/api/bids/${bidId}/hire`);
      alert("Freelancer hired successfully!");
      fetchGigAndBids();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to hire");
    }
  };

  if (!gig) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text py-16 px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/gigs"
          className="text-accent hover:underline mb-6 inline-block"
        >
          ← Back to Gigs
        </Link>

        {/* Gig Details Card */}
        <div className="bg-[#1f242d] p-8 rounded-3xl mb-8">
          <h1 className="text-3xl font-semibold mb-4">{gig.title}</h1>
          <p className="text-gray-400 mb-4">{gig.description}</p>
          <p className="text-accent text-2xl font-bold">₹{gig.budget}</p>
          <p className="text-sm text-gray-500 mt-2">
            Status: <span className="text-accent">{gig.status}</span>
          </p>

          {/* Edit/Delete Buttons for Owner */}
          {isOwner && (
            <div className="flex gap-4 mt-6">
              <Link
                to={`/edit/${gig._id}`}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:opacity-90"
              >
                Edit Gig
              </Link>
            </div>
          )}
        </div>

        {/* IF OWNER - SHOW BIDS */}
        {isOwner && (
          <div className="bg-[#1f242d] p-8 rounded-3xl">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Received <span className="text-accent">Bids</span>
            </h2>

            <div className="space-y-4">
              {bids.length === 0 && (
                <p className="text-gray-400 text-center">No bids yet</p>
              )}

              {bids.map((b) => (
                <div
                  key={b._id}
                  className="bg-[#222831] p-5 rounded-2xl flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-lg">
                      {b.freelancerId?.name || "Anonymous"}
                    </p>
                    <p className="text-accent font-bold">₹{b.price}</p>
                    <p className="text-sm text-gray-400 mt-1">{b.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Status: {b.status}
                    </p>
                  </div>

                  {b.status === "pending" && gig.status === "open" && (
                    <button
                      onClick={() => hire(b._id)}
                      className="bg-accent text-bg px-5 py-2 rounded-xl font-semibold hover:opacity-90"
                    >
                      Hire
                    </button>
                  )}

                  {b.status === "hired" && (
                    <span className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold">
                      Hired ✓
                    </span>
                  )}

                  {b.status === "rejected" && (
                    <span className="bg-red-600 text-white px-5 py-2 rounded-xl font-semibold">
                      Rejected
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IF NOT OWNER - SHOW MY BID OR BID FORM */}
        {!isOwner && (
          <>
            {/* Show user's existing bid */}
            {myBid && (
              <div className="bg-[#1f242d] p-8 rounded-3xl mb-8">
                <h2 className="text-2xl font-semibold mb-6 text-center">
                  Your <span className="text-accent">Bid</span>
                </h2>
                <div className="bg-[#222831] p-6 rounded-2xl">
                  <p className="text-accent font-bold text-xl">₹{myBid.price}</p>
                  <p className="text-gray-400 mt-2">{myBid.message}</p>
                  <p className="text-sm mt-4">
                    Status:{" "}
                    <span
                      className={
                        myBid.status === "hired"
                          ? "text-green-400"
                          : myBid.status === "rejected"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }
                    >
                      {myBid.status}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Bid form if no bid placed yet and gig is open */}
            {!myBid && gig.status === "open" && (
              <div className="bg-[#1f242d] p-8 rounded-3xl">
                <h2 className="text-2xl font-semibold mb-6 text-center">
                  Place a <span className="text-accent">Bid</span>
                </h2>

                <textarea
                  className="w-full bg-[#222831] text-text p-4 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-accent resize-none"
                  placeholder="Your proposal message..."
                  rows="4"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />

                <input
                  type="number"
                  className="w-full bg-[#222831] text-text p-4 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Your bid price (₹)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />

                <button
                  onClick={placeBid}
                  className="w-full bg-accent text-bg py-3 rounded-xl font-semibold hover:opacity-90"
                >
                  Submit Bid
                </button>
              </div>
            )}

            {gig.status === "assigned" && !myBid && (
              <div className="bg-[#1f242d] p-8 rounded-3xl text-center">
                <p className="text-gray-400 text-lg">
                  This gig has been assigned to a freelancer
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}