import express from "express";
import {
  followUser,
  getCurrentUser,
  getUserProfile,
  syncUser,
  updateProfile,
  updateUsername,
  checkUsernameAvailability,
  toggleVerification,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// public route
router.get("/profile/:username", getUserProfile);

// protected routes
router.post("/sync", protectRoute, syncUser);
router.get("/me", protectRoute, getCurrentUser);
router.put("/profile", protectRoute, updateProfile);
router.put("/username", protectRoute, updateUsername);
router.get("/check-username/:username", protectRoute, checkUsernameAvailability);
router.post("/follow/:targetUserId", protectRoute, followUser);
router.post("/verify/:targetUserId", protectRoute, toggleVerification);

export default router;
