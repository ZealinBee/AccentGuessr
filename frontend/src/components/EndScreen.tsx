import { useEffect } from "react";
import "../scss/EndScreen.scss";
import LoginButton from "./GoogleLoginButton";
import useAuth from "../hooks/useAuth";
import { useGame } from "../hooks/useGame";
import { Share2, Play } from "lucide-react";
import { track } from "../lib/firebase";
import { useRouter } from "next/navigation";

interface EndScreenProps {
  totalScore: number;
}

// Placeholder Ad Component (for preview until AdSense is approved)
// const PlaceholderAd = () => {
//   return (
//     <div className="placeholder-ad">
//       <div className="placeholder-ad-label">Advertisement</div>
//       <div className="placeholder-ad-content">
//         <div className="placeholder-ad-text">
//           <strong>AdSense Preview</strong>
//           <p>Your ad will appear here</p>
//         </div>
//       </div>
//     </div>
//   );
// };

function EndScreen({ totalScore }: EndScreenProps) {
  // const [shareSuccess, setShareSuccess] = useState(false);
  const router = useRouter();

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
    const shareText = `Can you guess the accent of this person? Try to beat my score: ${totalScore.toLocaleString()}`;
    const shareUrl = window.location.origin;

    // Track share event
    track('share', {
      method: 'share' in navigator ? 'web_share_api' : 'fallback',
      content_type: 'score',
      score: totalScore
    });

    // Check if Web Share API is available
    if ('share' in navigator && navigator.share) {
      try {
        await navigator.share({
          title: 'AccentGuessr',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or sharing failed
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
          fallbackShare(shareText, shareUrl);
        }
      }
    } else {
      // Fallback for browsers without Web Share API
      fallbackShare(shareText, shareUrl);
    }
  };

  const fallbackShare = (text: string, url: string) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // On mobile, show options for SMS and other platforms
      const smsText = encodeURIComponent(`${text}\n${url}`);
      const smsUrl = `sms:?&body=${smsText}`;

      // Try to open SMS
      window.location.href = smsUrl;
    } else {
      // On desktop, copy to clipboard
      const fullText = `${text}\n${url}`;
      navigator.clipboard.writeText(fullText).then(() => {
        alert('Score copied to clipboard!');
      }).catch((err) => {
        console.error('Failed to copy:', err);
        alert('Failed to copy score. Please try again.');
      });
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
            router.push("/");
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