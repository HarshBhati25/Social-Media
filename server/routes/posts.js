import express from "express";
import Post from "../models/Post.js";
import User from "../models/User.js"; // Import User model
import multer from "multer";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// POST: Create a new post
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const { caption } = req.body; // Use "caption" instead of "description"
    const image = req.file ? req.file.filename : null;

    const newPost = new Post({
      user: req.user.userId, // Use req.user.userId (from authMiddleware)
      caption, // Use "caption" instead of "description"
      image,
    });

    const savedPost = await newPost.save();
    const populatedPost = await Post.findById(savedPost._id)
      .populate("user", "username profileImage"); // Populate user field

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Error creating post", error: error.message });
  }
});

// GET: Retrieve posts from followed users
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // Get the logged-in user's ID

    // Fetch the logged-in user's following list
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Include the logged-in user's ID in the following list
    const followingIds = [...currentUser.following, userId];

    // Fetch posts from users in the following list
    const posts = await Post.find({ user: { $in: followingIds } })
      .populate("user", "username profileImage") // Populate user field
      .populate("comments.user", "username profileImage") // Populate comments.user field
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts", error: error.message });
  }
});

// POST: Like or Unlike a post
router.post("/:postId/like", authMiddleware, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.userId; // Get user ID from authMiddleware

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has already liked the post
    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      // If already liked, remove the like (unlike)
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      // If not liked, add the like
      post.likes.push(userId);
    }

    await post.save();

    // Populate the user field in the post
    const populatedPost = await Post.findById(postId)
      .populate("user", "username profileImage")
      .populate("likes", "username profileImage"); // Populate likes if needed

    res.status(200).json(populatedPost);
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Error liking post", error: error.message });
  }
});

// POST: Add a comment to a post
router.post("/:postId/comment", authMiddleware, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.userId; // Get user ID from authMiddleware
    const { text } = req.body; // Get comment text from request body

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Add the new comment
    post.comments.push({
      user: userId,
      comment: text,
    });

    await post.save();

    // Populate the user field in the comments
    const populatedPost = await Post.findById(postId)
      .populate("user", "username profileImage")
      .populate("comments.user", "username profileImage"); // Populate comments.user

    res.status(200).json(populatedPost);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment", error: error.message });
  }
});

export default router;