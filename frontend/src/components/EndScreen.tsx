import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../scss/EndScreen.scss";
import LoginButton from "./GoogleLoginButton";
import useAuth from "../hooks/useAuth";
import { useGame } from "../hooks/useGame";
import { Share2 } from "lucide-react";

interface EndScreenProps {
  totalScore: number;
}

function EndScreen({ totalScore }: EndScreenProps) {
  const navigate = useNavigate();
  const [shareSuccess, setShareSuccess] = useState(false);

  const { isLoggedIn } = useAuth();
  const { resetGame, startGame } = useGame();

  const newGame = () => {
    resetGame();
    startGame();
  };

  const handleShare = async () => {
    const homeLink = window.location.origin;
    const scorePercentage = ((totalScore / 25000) * 100).toFixed(1);

    const shareText = `🎯 Just played AccentGuessr!\n\n📊 My Score:\n${totalScore.toLocaleString()} / 25,000 (${scorePercentage}%)\n\n🌍 Can you beat my score?\nPlay now: ${homeLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '🎯 My AccentGuessr Score',
          text: shareText,
          url: homeLink,
        });
      } catch (err) {
        console.error('Failed to share:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
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

        <button
          className="end-screen-share-button"
          onClick={handleShare}
          title="Share your score"
        >
          <Share2 size={18} />
          <span>Share Score</span>
          {shareSuccess && <span className="end-screen-share-tooltip">Copied to clipboard!</span>}
        </button>

        {!isLoggedIn && (
          <>
            <p className="end-screen-message">
              Sign up to save your progress so no repeating games:
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
