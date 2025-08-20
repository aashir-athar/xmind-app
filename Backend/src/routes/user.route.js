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
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

// public route
router.get("/profile/:username", getUserProfile);

// protected routes
router.post("/sync", protectRoute, syncUser);
router.get("/me", protectRoute, getCurrentUser);
router.post("/profile", protectRoute, updateProfile);
router.post("/profile", protectRoute, upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 }
]), updateProfile);
router.post("/username", protectRoute, updateUsername);
router.get("/check-username/:username", protectRoute, checkUsernameAvailability);
router.post("/follow/:targetUserId", protectRoute, followUser);
router.post("/verify/:targetUserId", protectRoute, toggleVerification);

export default router;
