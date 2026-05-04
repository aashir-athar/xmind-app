import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      maxLength: 280,
    },
    image: {
      type: String,
      default: "",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

// Feed paging — `{ createdAt: -1, _id: -1 }` is the hot read path.
postSchema.index({ createdAt: -1, _id: -1 });
// Profile feed — every "posts by this user" page issues this query.
postSchema.index({ user: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

export default Post;
