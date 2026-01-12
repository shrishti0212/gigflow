import Bid from "../models/Bid.js";
import Gig from "../models/Gig.js";
import mongoose from "mongoose";

/* 1️⃣ CREATE BID (FREELANCER) */
export const createBid = async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    if (!gigId || !message || !price) {
      return res.status(400).json({ message: "All fields required" });
    }

    const gig = await Gig.findById(gigId);
    if (!gig || gig.status !== "open") {
      return res.status(400).json({ message: "Gig not available" });
    }

    // prevent owner from bidding on own gig
    if (gig.ownerId.toString() === req.userId) {
      return res.status(403).json({ message: "You cannot bid on your own gig" });
    }

    const bid = await Bid.create({
      gigId,
      freelancerId: req.userId,
      message,
      price,
      status: "pending",
    });

    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 2️⃣ GET MY BIDS (FREELANCER DASHBOARD) */
export const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancerId: req.userId })
      .populate("gigId", "title budget status")
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 3️⃣ GET BIDS FOR A GIG (CREATOR ONLY) */
export const getBidsForGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (!gig) return res.status(404).json({ message: "Gig not found" });

    if (gig.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const bids = await Bid.find({ gigId: gig._id })
      .populate("freelancerId", "name email")
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 4️⃣ HIRE BID (CREATOR) */
/* 4️⃣ HIRE BID (CREATOR) - WITH SOCKET NOTIFICATION */
export const hireBid = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("🔍 Hiring bid:", req.params.bidId);

    const bid = await Bid.findById(req.params.bidId)
      .populate("freelancerId", "name email")
      .session(session);
    
    if (!bid) {
      console.log("❌ Bid not found");
      throw new Error("Bid not found");
    }

    const gig = await Gig.findById(bid.gigId).session(session);
    if (!gig) {
      console.log("❌ Gig not found");
      throw new Error("Gig not found");
    }

    if (gig.ownerId.toString() !== req.userId) {
      console.log("❌ Not authorized");
      throw new Error("Not authorized");
    }

    if (gig.status === "assigned") {
      console.log("❌ Gig already assigned");
      throw new Error("Gig already assigned");
    }

    // Update gig and bids
    gig.status = "assigned";
    await gig.save({ session });

    bid.status = "hired";
    await bid.save({ session });

    await Bid.updateMany(
      { gigId: gig._id, _id: { $ne: bid._id } },
      { status: "rejected" },
      { session }
    );

    await session.commitTransaction();
    console.log("✅ Bid hired successfully");

    // 🔔 EMIT SOCKET NOTIFICATION TO FREELANCER
    const io = req.app.get("io");
    const freelancerId = bid.freelancerId._id.toString();
    
    console.log("🔔 Attempting to send notification to:", freelancerId);
    
    if (io) {
      io.to(freelancerId).emit("hired", {
        message: `🎉 You've been hired for "${gig.title}"!`,
        gigId: gig._id,
        gigTitle: gig.title,
        bidId: bid._id,
      });
      console.log(`✅ Notification emitted to user ${freelancerId}`);
    } else {
      console.log("❌ Socket.io not available");
    }

    res.json({ 
      message: "Freelancer hired successfully",
      hired: {
        freelancerId: bid.freelancerId._id,
        freelancerName: bid.freelancerId.name,
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("❌ Hire error:", error.message);
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};


/* 5️⃣ GET SINGLE BID DETAILS (FOR FREELANCER) */
export const getMyBidForGig = async (req, res) => {
  try {
    const { gigId } = req.params;

    const bid = await Bid.findOne({
      gigId,
      freelancerId: req.userId,
    }).populate("gigId", "title budget status");

    if (!bid) {
      return res.status(404).json({ message: "No bid found for this gig" });
    }

    res.json(bid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};