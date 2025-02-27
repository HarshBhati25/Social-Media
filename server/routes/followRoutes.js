import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Follow a user
router.put("/:id/follow", authMiddleware, async (req, res) => {
  try {
    const userToFollowId = req.params.id;
    const currentUserId = req.user.userId;

    if (userToFollowId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }

    const userToFollow = await User.findById(userToFollowId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    if (currentUser.following.includes(userToFollowId)) {
      return res.status(400).json({ message: "You are already following this user." });
    }

    currentUser.following.push(userToFollowId);
    userToFollow.followers.push(currentUserId);

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({ message: "User followed successfully.", currentUser });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Unfollow a user
router.put("/:id/unfollow", authMiddleware, async (req, res) => {
  try {
    const userToUnfollowId = req.params.id;
    const currentUserId = req.user.userId;

    if (userToUnfollowId === currentUserId) {
      return res.status(400).json({ message: "You cannot unfollow yourself." });
    }

    const userToUnfollow = await User.findById(userToUnfollowId);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!currentUser.following.includes(userToUnfollowId)) {
      return res.status(400).json({ message: "You are not following this user." });
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userToUnfollowId
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== currentUserId
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({ message: "User unfollowed successfully.", currentUser });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

export default router;
