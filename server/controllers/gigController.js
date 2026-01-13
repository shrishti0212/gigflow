import Gig from "../models/Gig.js";

/* CREATE GIG (CREATOR) */
export const createGig = async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    if (!title || !description || !budget) {
      return res.status(400).json({ message: "All fields required" });
    }

    const gig = await Gig.create({
      title,
      description,
      budget,
      ownerId: req.userId,
      status: "open",
    });

    res.status(201).json(gig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* MY GIGS (CREATOR VIEW) */
export const getMyGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ ownerId: req.userId })
      .sort({ createdAt: -1 });

    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ✅ AVAILABLE GIGS WITH SEARCH (FREELANCER VIEW) */
export const getAvailableGigs = async (req, res) => {
  try {
    const { search } = req.query;

    // Build query
    const query = {
      ownerId: { $ne: req.userId },
      status: "open",
    };

    // ✅ Add search filter if provided
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const gigs = await Gig.find(query)
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });

    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* SINGLE GIG DETAILS (SMART) */
export const getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    const isOwner = gig.ownerId.toString() === req.userId;

    res.json({
      gig,
      isOwner,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* UPDATE GIG (OWNER ONLY) */
export const updateGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: "Gig not found" });

    if (gig.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(gig, req.body);
    await gig.save();

    res.json(gig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* DELETE GIG (OWNER ONLY) */
export const deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: "Gig not found" });

    if (gig.ownerId.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await gig.deleteOne();
    res.json({ message: "Gig deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};