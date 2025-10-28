import { useNavigate } from "react-router-dom";
import "../scss/EndScreen.scss";
import LoginButton from "./GoogleLoginButton";
import useAuth from "../hooks/useAuth";
import { useGame } from "../hooks/useGame";

interface EndScreenProps {
  totalScore: number;
}

function EndScreen({ totalScore }: EndScreenProps) {
  const navigate = useNavigate();

  const { isLoggedIn } = useAuth();
  const { resetGame, startGame } = useGame();

  const newGame = () => {
    resetGame();
    startGame();
  };

  return (
    <div className="end-screen-container">
      <div className="background-image"></div>
      <div className="background-overlay"></div>
      <div className="end-screen-card">
        <button
          className="end-screen-back-home-button"
          onClick={() => {
            resetGame();
            navigate("/");
          }}
        >
          ← Home
        </button>
        <h1 className="end-screen-title">Thanks for playing! </h1>
        <h2 className="end-screen-score-heading">Your total score:</h2>
        <div className="end-screen-score">
          {totalScore.toLocaleString()} / 25,000
        </div>

        {!isLoggedIn && (
          <>
            <p className="end-screen-message">
              Sign up to play more and save your progress:
            </p>
            <div className="end-screen-google-button">
              <LoginButton message="Continue with Google" />
            </div>
          </>
        )}
        {isLoggedIn && (
          <>
            <p className="end-screen-message">Play a new game:</p>
            <div className="button-wrapper">
              <button
                className="end-screen-play-again-button"
                onClick={newGame}
              >
                Play again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EndScreen;
