// routes/userRoutes.js
import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();


// Get all users
router.get("/", authMiddleware, async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Exclude password field
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});


// Follow a user
router.put("/:id/follow", authMiddleware, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) return res.status(404).json({ message: "User not found" });

    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) return res.status(404).json({ message: "Current user not found" });

    // Check if the current user is already following the user
    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ message: "You are already following this user" });
    }

    // Add user to current user's following list
    currentUser.following.push(userToFollow._id);
    // Add current user to the followed user's followers list
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({ message: "User followed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Unfollow a user
router.put('/:id/unfollow', authMiddleware, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    if (!userToUnfollow) return res.status(404).json({ message: 'User not found' });

    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) return res.status(404).json({ message: 'Current user not found' });

    // Check if the current user is following the user
    if (!currentUser.following.includes(userToUnfollow._id)) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    // Remove user from current user's following list
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userToUnfollow._id.toString()
    );
    // Remove current user from the followed user's followers list
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// routes/userRoutes.js
// GET /api/users/suggested - Get suggested users
// routes/userRoutes.js
router.get("/suggested", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming you have authentication middleware

    // Find the current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch users not followed by the current user
    const suggestedUsers = await User.find({
      _id: { $ne: userId, $nin: currentUser.following },
    }).limit(5); // Limit to 5 users

    res.status(200).json(suggestedUsers);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// routes/userRoutes.js
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // Get the logged-in user's ID
    const user = await User.findById(userId).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
