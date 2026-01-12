import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createBid,
  getMyBids,
  getBidsForGig,
  hireBid,
  getMyBidForGig
} from "../controllers/bidController.js";

const router = express.Router();

router.post("/", authMiddleware, createBid);
router.get("/my", authMiddleware, getMyBids);
router.get("/gig/:gigId", authMiddleware, getBidsForGig);
router.get("/my-bid/:gigId", authMiddleware, getMyBidForGig);
// router.patch("/:bidId/hire", authMiddleware, hireBid);

router.patch(
  "/:bidId/hire",
  authMiddleware,
  (req, res, next) => {
    console.log("🔥 PATCH /api/bids/:id/hire HIT");
    console.log("🍪 Cookies:", req.cookies);
    console.log("👤 UserId from token:", req.userId);
    next();
  },
  hireBid
);



export default router;
