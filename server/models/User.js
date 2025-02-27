// User.js
import mongoose from "mongoose";

const defaultAvatar = "http://localhost:5000/public/default-avatar.png"; // Default avatar URL

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: defaultAvatar }, // Ensure this field exists
  followers: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
  following: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
}, { timestamps: true });

export default mongoose.model("User", UserSchema);