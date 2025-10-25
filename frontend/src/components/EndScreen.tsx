import { useNavigate } from "react-router-dom";
import "../scss/EndScreen.scss";
import LoginButton from "./GoogleLoginButton";
import { useEffect, useState } from "react";

interface EndScreenProps {
  totalScore: number;
}

function EndScreen({ totalScore }: EndScreenProps) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="end-screen-container">
      <div className="background-image"></div>
      <div className="background-overlay"></div>
      <div className="end-screen-card">
        <h1 className="end-screen-title">Thanks for playing! </h1>
        <h2 className="end-screen-score-heading">Your total score:</h2>
        <div className="end-screen-score">
          {totalScore.toLocaleString()} / 25,000
        </div>
        <p className="end-screen-message">
          This game is still in its early stages, stay tuned for new updates!
        </p>
        <p className="end-screen-message">
          Volunteer {isLoggedIn ? "if you want your voice to be in the game too:" : "or Sign up to Save Your Progress and Play more Games"}
        </p>
        <div className="button-wrapper">
          <button
            onClick={() => navigate("/volunteer")}
            className="end-screen-volunteer-button"
          >
            Volunteer
          </button>
        </div>
        {!isLoggedIn && <LoginButton />}
      </div>
    </div>
  );
}

export default EndScreen;
