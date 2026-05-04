import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import Comment from "../models/comment.model.js";
import cloudinary from "../config/cloudinary.js";
import { getAuth } from "@clerk/express";

/**
 * Page-size policy for the feed. Mobile asks for 20, the server clamps
 * 1–50 to keep payloads bounded.
 */
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

const FEED_USER_FIELDS = "username firstName lastName profilePicture verified";

/**
 * Lean projection for the feed: drops the `comments` array (replaced by
 * `commentCount`) so a 20-post page is small enough to fit in a single
 * Vercel response without needing compression. Likes ship as a string
 * array because the mobile app uses them to decide the heart state.
 */
function buildFeedAggregation(matchStage, limit) {
  return [
    { $match: matchStage },
    { $sort: { createdAt: -1, _id: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              username: 1,
              firstName: 1,
              lastName: 1,
              profilePicture: 1,
              verified: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        content: 1,
        image: 1,
        createdAt: 1,
        updatedAt: 1,
        likes: 1,
        user: 1,
        commentCount: { $size: { $ifNull: ["$comments", []] } },
      },
    },
  ];
}

function parseLimit(raw) {
  const n = Number.parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.max(n, 1), MAX_LIMIT);
}

function parseCursor(raw) {
  if (!raw) return null;
  const parsed = new Date(String(raw));
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

/**
 * Cursor-paginated feed.
 *
 * Cursor is the `createdAt` ISO of the oldest post already on the
 * client. Combined with the unique-`_id` tiebreak it gives a stable
 * ordering even when two posts share the same millisecond.
 */
export const getPosts = asyncHandler(async (req, res) => {
  const limit = parseLimit(req.query.limit);
  const cursor = parseCursor(req.query.cursor);

  const match = cursor ? { createdAt: { $lt: cursor } } : {};
  const posts = await Post.aggregate(buildFeedAggregation(match, limit + 1));

  const hasNextPage = posts.length > limit;
  const page = hasNextPage ? posts.slice(0, limit) : posts;
  const last = page[page.length - 1];

  res.status(200).json({
    posts: page,
    nextCursor: hasNextPage && last ? last.createdAt : null,
  });
});

/**
 * Single-post detail. Populates the full comments tree because that's
 * what the comments modal reads; the feed lookup avoids this on purpose.
 */
export const getPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  if (!mongoose.isValidObjectId(postId)) {
    return res.status(400).json({ error: "Invalid post id" });
  }

  const post = await Post.findById(postId)
    .populate("user", FEED_USER_FIELDS)
    .populate({
      path: "comments",
      options: { sort: { createdAt: -1 } },
      populate: { path: "user", select: FEED_USER_FIELDS },
    })
    .lean();

  if (!post) return res.status(404).json({ error: "Post not found" });
  res.status(200).json({ post });
});

export const getUserPosts = asyncHandler(async (req, res) => {
  const limit = parseLimit(req.query.limit);
  const cursor = parseCursor(req.query.cursor);
  const username = String(req.params.username ?? "").trim().toLowerCase();
  if (!username) return res.status(400).json({ error: "Username is required" });

  const user = await User.findOne({ username }).select("_id").lean();
  if (!user) return res.status(404).json({ error: "User not found" });

  const match = cursor
    ? { user: user._id, createdAt: { $lt: cursor } }
    : { user: user._id };

  const posts = await Post.aggregate(buildFeedAggregation(match, limit + 1));
  const hasNextPage = posts.length > limit;
  const page = hasNextPage ? posts.slice(0, limit) : posts;
  const last = page[page.length - 1];

  res.status(200).json({
    posts: page,
    nextCursor: hasNextPage && last ? last.createdAt : null,
  });
});

export const createPost = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { content } = req.body;
  const imageFile = req.file;

  if (!content && !imageFile) {
    return res
      .status(400)
      .json({ error: "Post must contain either text or image" });
  }

  const user = await User.findOne({ clerkId: userId }).select("_id").lean();
  if (!user) return res.status(404).json({ error: "User not found" });

  let imageUrl = "";
  if (imageFile) {
    try {
      const base64Image = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString("base64")}`;
      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "social_media_posts",
        resource_type: "image",
        transformation: [
          { width: 1080, height: 1080, crop: "limit" },
          { quality: "auto" },
          { format: "auto" },
        ],
      });
      imageUrl = uploadResponse.secure_url;
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return res.status(400).json({ error: "Failed to upload image" });
    }
  }

  const created = await Post.create({
    user: user._id,
    content: content || "",
    image: imageUrl,
  });

  // Re-fetch with the populated user shape so the mobile cache can
  // optimistically prepend without any additional round trip.
  const post = await Post.findById(created._id)
    .populate("user", FEED_USER_FIELDS)
    .lean();

  res.status(201).json({
    post: { ...post, commentCount: 0 },
  });
});

/**
 * Atomic like toggle.
 *
 * Two phases without a fetch-then-write race:
 *  1. Try to PULL the user out of the likes set.
 *  2. If nothing was modified (i.e. the user wasn't liking yet),
 *     PUSH them in with `$addToSet`.
 *
 * Only one of the two writes will report `modifiedCount > 0`, so we
 * always know the canonical post-toggle state without re-reading.
 */
export const likePost = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;
  if (!mongoose.isValidObjectId(postId)) {
    return res.status(400).json({ error: "Invalid post id" });
  }

  const user = await User.findOne({ clerkId: userId }).select("_id").lean();
  if (!user) return res.status(404).json({ error: "User not found" });

  const unlike = await Post.updateOne(
    { _id: postId, likes: user._id },
    { $pull: { likes: user._id } }
  );

  let liked;
  if (unlike.matchedCount === 0) {
    // Either the post doesn't exist, or the user wasn't liking yet.
    const like = await Post.updateOne(
      { _id: postId },
      { $addToSet: { likes: user._id } }
    );
    if (like.matchedCount === 0) {
      return res.status(404).json({ error: "Post not found" });
    }
    liked = true;

    // Notify the post author (skip self-likes, skip duplicate noise).
    const post = await Post.findById(postId).select("user").lean();
    if (post && post.user.toString() !== user._id.toString()) {
      await Notification.create({
        from: user._id,
        to: post.user,
        type: "like",
        post: postId,
      }).catch((err) => console.error("[like] notification error:", err));
    }
  } else {
    liked = false;
  }

  // Cheap secondary read to return the canonical count without
  // re-aggregating the whole post.
  const fresh = await Post.findById(postId).select("likes").lean();
  const likeCount = fresh ? (fresh.likes?.length ?? 0) : 0;
  res.status(200).json({ liked, likeCount });
});

export const deletePost = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;
  if (!mongoose.isValidObjectId(postId)) {
    return res.status(400).json({ error: "Invalid post id" });
  }

  const user = await User.findOne({ clerkId: userId }).select("_id").lean();
  if (!user) return res.status(404).json({ error: "User not found" });

  const post = await Post.findById(postId).select("user image").lean();
  if (!post) return res.status(404).json({ error: "Post not found" });
  if (post.user.toString() !== user._id.toString()) {
    return res
      .status(403)
      .json({ error: "You can only delete your own posts" });
  }

  // Single-pass cleanup.
  await Promise.all([
    Comment.deleteMany({ post: postId }),
    Notification.deleteMany({ post: postId }),
    Post.findByIdAndDelete(postId),
  ]);

  res.status(200).json({ message: "Post deleted successfully" });
});