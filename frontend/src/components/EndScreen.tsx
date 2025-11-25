import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../scss/EndScreen.scss";
import LoginButton from "./GoogleLoginButton";
import useAuth from "../hooks/useAuth";
import { useGame } from "../hooks/useGame";
import { Share2, Play } from "lucide-react";

interface EndScreenProps {
  totalScore: number;
}

// Placeholder Ad Component (for preview until AdSense is approved)
const PlaceholderAd = () => {
  return (
    <div className="placeholder-ad">
      <div className="placeholder-ad-label">Advertisement</div>
      <div className="placeholder-ad-content">
        <div className="placeholder-ad-text">
          <strong>AdSense Preview</strong>
          <p>Your ad will appear here</p>
        </div>
      </div>
    </div>
  );
};

function EndScreen({ totalScore }: EndScreenProps) {
  const navigate = useNavigate();
  const [shareSuccess, setShareSuccess] = useState(false);

  const { isLoggedIn } = useAuth();
  const { resetGame, startGame } = useGame();

  // Load AdSense ads
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  const newGame = () => {
    resetGame();
    startGame();
  };

  const handleShare = async () => {
    // ...existing code...
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

        {/* Ad at the top */}
        <div className="end-screen-ad-container">
          {/* <PlaceholderAd /> */}
          {/* Real ad - will match placeholder styling exactly */}
          <ins className="adsbygoogle end-screen-ad"
               style={{ display: 'none' }}
               data-ad-client="ca-pub-1290357879552342"
               data-ad-slot="4836802390"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
        </div>

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
                <Play size={18} />
                <span>Play again</span>
              </button>
            </div>
          </>
        )}

        {/* Ad at the bottom */}
        <div className="end-screen-ad-container">
          {/* <PlaceholderAd /> */}
          {/* Real ad - will match placeholder styling exactly */}
          <ins className="adsbygoogle end-screen-ad"
               style={{ display: 'none' }}
               data-ad-client="ca-pub-1290357879552342"
               data-ad-slot="4836802390"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
        </div>
      </div>
    </div>
  );
}

export default EndScreen;