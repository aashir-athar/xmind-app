import asyncHandler from "express-async-handler";
import { getAuth } from "@clerk/express";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const comments = await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture");

  res.status(200).json({ comments });
});

export const createComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Comment content is required" });
  }

  const user = await User.findOne({ clerkId: userId });
  const post = await Post.findById(postId);

  if (!user || !post)
    return res.status(404).json({ error: "User or post not found" });

  const session = await Comment.startSession();

  try {
    await session.withTransaction(async () => {
      const comment = await Comment.create(
        [
          {
            user: user._id,
            post: postId,
            content,
          },
        ],
        { session }
      );

      // link the comment to the post
      await Post.findByIdAndUpdate(
        postId,
        {
          $push: { comments: comment[0]._id },
        },
        { session }
      );

      // create notification if not commenting on own post
      if (post.user.toString() !== user._id.toString()) {
        await Notification.create(
          [
            {
              from: user._id,
              to: post.user,
              type: "comment",
              post: postId,
              comment: comment[0]._id,
            },
          ],
          { session }
        );
      }

      res.status(201).json({ comment: comment[0] });
    });
  } finally {
    await session.endSession();
  }
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { commentId } = req.params;

  const user = await User.findOne({ clerkId: userId });
  const comment = await Comment.findById(commentId);

  if (!user || !comment) {
    return res.status(404).json({ error: "User or comment not found" });
  }

  if (comment.user.toString() !== user._id.toString()) {
    return res
      .status(403)
      .json({ error: "You can only delete your own comments" });
  }

  const session = await Comment.startSession();

  try {
    await session.withTransaction(async () => {
      // remove comment from post
      await Post.findByIdAndUpdate(
        comment.post,
        {
          $pull: { comments: commentId },
        },
        { session }
      );

      // clean up related notifications
      await Notification.deleteMany(
        {
          comment: commentId,
        },
        { session }
      );

      // delete the comment
      await Comment.findByIdAndDelete(commentId, { session });
    });

    res.status(200).json({ message: "Comment deleted successfully" });
  } finally {
    await session.endSession();
  }
});
