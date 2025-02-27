import Navbar from "./Navbar";
import Posts from "./Posts";
import SuggestedProfiles from "./SuggestedProfiles";
import "../styles/MainLayout.css";

function MainLayout({ onLogout, token, user, updateUser }) {
  return (
    <div className="main-lout">
      <Navbar onLogout={onLogout} user={user} />
      <div className="content">
        <Posts token={token} user={user} />
        <SuggestedProfiles token={token} updateUser={updateUser} />
      </div>
    </div>
  );
}

export default MainLayout;
