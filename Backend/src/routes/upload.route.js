import express from "express";
import { uploadImage } from "../controllers/upload.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

// Protected route for image uploads
router.post("/image", protectRoute, upload.single("image"), uploadImage);

export default router;
