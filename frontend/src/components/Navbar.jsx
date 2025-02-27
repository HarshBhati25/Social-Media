import { useState } from "react";
import "../styles/Navbar.css";
import postifyLogo from "../assets/postify-logo.png";
import defaultAvatar from "../assets/default-avatar.png";

function Navbar({ onLogout, user }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-title-img">
        <h1>Postify</h1>
        <img className="logo" alt="Postify Logo" src={postifyLogo} />
      </div>
      <div className="nav-actions">
        <button className="profile-btn" onClick={toggleProfile}>
          Profile
        </button>
        {isProfileOpen && (
          <div className="profile-info">
            <img className="profile-img" alt="Profile" src={defaultAvatar} />
            <p className="profile-username">{user?.username}</p>
            <p className="profile-followers">
              <strong>Followers:</strong> {user?.followers?.length || 0}
            </p>
            <p className="profile-following">
              <strong>Following:</strong> {user?.following?.length || 0}
            </p>
          </div>
        )}
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
