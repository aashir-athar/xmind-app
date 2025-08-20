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
  autoVerifyUser,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

// public route
router.get("/profile/:username", getUserProfile);

// protected routes
router.post("/sync", protectRoute, syncUser);
router.get("/me", protectRoute, getCurrentUser);

// Profile update route - supports both single image and multiple images like posts
router.post(
  "/profile",
  protectRoute,
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]),
  updateProfile
);

// Username update route - fixed path
router.put("/username", protectRoute, updateUsername);

// Check username availability
router.get(
  "/check-username/:username",
  protectRoute,
  checkUsernameAvailability
);

// Follow user
router.post("/follow/:targetUserId", protectRoute, followUser);

// Verification routes
router.post("/verify/:targetUserId", protectRoute, toggleVerification);
router.post("/verify", protectRoute, autoVerifyUser); // Auto-verification endpoint

export default router;
