import React, { useState, useEffect } from "react";
import MainLayout from "./components/MainLayout";
import AuthPage from "./components/AuthPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  // Check for a saved token and user in localStorage on initial load
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser); // Safely parse the user data
        setIsLoggedIn(true);
        setToken(savedToken);
        setUser(user);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        // Clear invalid data from localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Handle login
  const handleLogin = (token, user) => {
    setIsLoggedIn(true);
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user)); // Ensure user is valid JSON
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Update user data after follow/unfollow
  const updateUser = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      setUser(data); // Update the user state
      localStorage.setItem("user", JSON.stringify(data)); // Update localStorage
    } catch (error) {
      console.error("Error updating user data:", error.message);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        throw new Error("Image upload failed");
      }

      const data = await response.json();
      setImageUrl(data.imageUrl); // Store the URL of the uploaded image
      setImage(file); // Optionally, store the file for any further use
    } catch (error) {
      console.error("Error uploading image:", error.message);
    }
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        <MainLayout
          onLogout={handleLogout}
          token={token}
          user={user}
          updateUser={updateUser} // Pass the updateUser function
        />
      ) : (
        <AuthPage onLogin={handleLogin} />
      )}

      {/* Image upload section */}
      <div>
        <h2>Upload an Image</h2>
        <input type="file" onChange={handleImageUpload} />
        {imageUrl && (
          <div>
            <h3>Uploaded Image:</h3>
            <img src={imageUrl} alt="Uploaded" width="300" />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
