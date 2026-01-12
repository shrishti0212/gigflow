import express from "express";
import {
  createGig,
  getMyGigs,
  getAvailableGigs,
  getGigById,
  updateGig,
  deleteGig,
} from "../controllers/gigController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createGig);
router.get("/my", authMiddleware, getMyGigs);
router.get("/available", authMiddleware, getAvailableGigs);
router.get("/:id", authMiddleware, getGigById);
router.put("/:id", authMiddleware, updateGig);
router.delete("/:id", authMiddleware, deleteGig);

export default router;
