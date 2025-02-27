import { useState, useEffect } from "react";
import defaultAvatar from "../assets/default-avatar.png";
import "../styles/SuggestedProfiles.css";

function SuggestedProfiles({ token, updateUser }) {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followStates, setFollowStates] = useState({});
  const [error, setError] = useState("");

  // Fetch suggested users from the backend
  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/users/suggested",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch suggested users");
        }

        const data = await response.json();
        setSuggestedUsers(data);

        // Initialize follow states
        const initialFollowStates = data.reduce((acc, user) => {
          acc[user._id] = user.isFollowing || false; // Assuming the backend returns `isFollowing`
          return acc;
        }, {});
        setFollowStates(initialFollowStates);
      } catch (error) {
        console.error("Error fetching suggested users:", error.message);
        setError("Failed to load suggested users. Please try again later.");
      }
    };

    fetchSuggestedUsers();
  }, [token]);

  // Toggle follow/unfollow
  const toggleFollow = async (userId) => {
    try {
      const endpoint = followStates[userId]
        ? `http://localhost:5000/api/users/${userId}/unfollow`
        : `http://localhost:5000/api/users/${userId}/follow`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to toggle follow");
      }

      // Update the follow state
      setFollowStates((prevState) => ({
        ...prevState,
        [userId]: !prevState[userId],
      }));

      // Refresh the user data
      await updateUser();
    } catch (error) {
      console.error("Error toggling follow:", error.message);
      setError("Failed to toggle follow. Please try again later.");
    }
  };

  return (
    <div className="suggested-container">
      <h3>Suggested for You</h3>
      {error && <p className="error-message">{error}</p>}
      <div className="suggested-users-wrapper">
        {suggestedUsers.map((user) => (
          <div key={user._id} className="suggested-user">
            <img
              src={defaultAvatar}
              alt={user.username}
              className="profile-img"
            />
            <span className="username">{user.username}</span>
            <button
              className={`follow-btn ${
                followStates[user._id] ? "following" : ""
              }`}
              onClick={() => toggleFollow(user._id)}
            >
              {followStates[user._id] ? "Following" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SuggestedProfiles;
