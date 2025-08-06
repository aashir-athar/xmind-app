import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getNotifications,
  deleteNotification,
} from "../controllers/notification.controller.js";
import { arcjetMiddleware } from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.get("/", arcjetMiddleware, protectRoute, getNotifications);
router.delete(
  "/:notificationId",
  arcjetMiddleware,
  protectRoute,
  deleteNotification
);

export default router;
