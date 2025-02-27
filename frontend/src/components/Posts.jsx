import { useState, useEffect } from "react";
import "../styles/Posts.css";
import defaultAvatar from "../assets/default-avatar.png";

function Posts({ token }) {
  const [posts, setPosts] = useState([]);
  const [newCaption, setNewCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [commentInputs, setCommentInputs] = useState({}); // Stores comment input for each post

  // Fetch posts from the backend
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/posts", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error.message);
        alert("Failed to fetch posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [token]);

  // Add a new post
  const handleAddPost = async () => {
    if (!newCaption.trim()) {
      alert("Please write something to post");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ caption: newCaption, user: token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create post");
      }

      const newPost = await response.json();
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      setNewCaption("");
    } catch (error) {
      console.error("Error creating post:", error.message);
      alert("Failed to create post. Please try again.");
    }
  };

  // Handle like button click
  const handleLike = async (postId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${postId}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to like post");
      }

      const updatedPost = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? updatedPost : post))
      );
    } catch (error) {
      console.error("Error liking post:", error.message);
      alert("Failed to like post. Please try again.");
    }
  };

  // Handle comment button click
  const handleComment = async (postId) => {
    const comment = commentInputs[postId];
    if (!comment?.trim()) {
      alert("Please enter a comment");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${postId}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: comment }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const updatedPost = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? updatedPost : post))
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: "" })); // Clear comment input
    } catch (error) {
      console.error("Error adding comment:", error.message);
      alert("Failed to add comment. Please try again.");
    }
  };

  return (
    <div className="posts-container">
      <div className="new-post">
        <input
          type="text"
          placeholder="Write here..."
          value={newCaption}
          onChange={(e) => setNewCaption(e.target.value)}
          className="new-post-input"
        />
        <button onClick={handleAddPost} className="new-post-btn">
          Post
        </button>
      </div>

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length > 0 ? (
        posts.map((post) => (
          <div key={post._id} className="post">
            <div className="post-header">
              <img
                src={post.userId?.profilePicture || defaultAvatar}
                alt={post.userId?.username || "User"}
                className="user-img"
              />
              <span className="username">
                {post.user?.username || "Unknown"}
              </span>
            </div>
            <div className="post-details">
              <p className="caption">{post.caption}</p>
              <div className="post-actions">
                <span onClick={() => handleLike(post._id)}>
                  ❤️ {post.likes?.length || 0}
                </span>
                <span>💬 {post.comments?.length || 0}</span>
              </div>
              {/* Always show comments section */}
              <div className="comments-section">
                <div className="comments-list">
                  {post.comments?.map((comment, index) => (
                    <div key={index} className="comment">
                      <strong>{comment.user?.username || "Unknown"}:</strong>{" "}
                      {comment.comment}
                    </div>
                  ))}
                </div>
                <div className="comment-input-container">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentInputs[post._id] || ""}
                    onChange={(e) =>
                      setCommentInputs((prev) => ({
                        ...prev,
                        [post._id]: e.target.value,
                      }))
                    }
                    className="comment-input"
                  />
                  <button
                    onClick={() => handleComment(post._id)}
                    className="comment-btn"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No posts available</p>
      )}
    </div>
  );
}

export default Posts;
