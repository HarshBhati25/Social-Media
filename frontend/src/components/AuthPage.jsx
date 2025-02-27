import { useState } from "react";
import AuthForm from "../components/AuthForm";
import "@fontsource/great-vibes";
import "../styles/AuthPage.css";

function AuthPage({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="app-title">Postify</h1>
        <AuthForm isSignUp={isSignUp} onLogin={onLogin} />
        <p>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <span className="toggle-link" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Sign In" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}
export default AuthPage;
