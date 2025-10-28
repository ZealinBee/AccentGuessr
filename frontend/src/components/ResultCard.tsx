import { useState } from "react";
import "../scss/ResultCard.scss";

interface ResultCardProps {
  answerDistance: number;
  score: number;
  gameRound: number;
  handleNext: () => void;
  accentName: string;
  accentDescription: string;
}

function ResultCard({
  answerDistance,
  score,
  gameRound,
  handleNext,
  accentName,
  accentDescription,
}: ResultCardProps) {
  const maxScore = 5000;
  const safeScore = typeof score === "number" ? score : 0;
  const percent = Math.max(0, Math.min(100, (safeScore / maxScore) * 100));
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div className={`result-card ${showDetails ? 'expanded' : ''}`}>
        <div className="result-card-header">
          <div className="result-title">Accent: {accentName}</div>

          <div className="result-text">
            {score === 5000 ? (
              <>Perfect! You nailed it exactly!</>
            ) : (
              <>Your guess was {answerDistance?.toLocaleString()} km away.</>
            )}
          </div>

          <div className="score-text">
            Score: {score ?? "-"} / {maxScore}
          </div>

          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={maxScore}
            aria-valuenow={typeof score === "number" ? Math.round(score) : 0}
            className="progress-container"
          >
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>

          <button onClick={handleNext} className="next-button">
            {gameRound < 4 ? "Next Round" : "Finish Game"}
          </button>

          {accentDescription && !showDetails && (
            <button
              onClick={() => setShowDetails(true)}
              className="details-toggle-button"
            >
              Learn more about {accentName} accent
            </button>
          )}
        </div>

        {showDetails && accentDescription && (
          <div className="accent-description">
            <div className="accent-description-header">
              <h3>About the {accentName} Accent</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="close-button"
                aria-label="Close details"
              >
                ×
              </button>
            </div>
            <div className="accent-description-content">
              <p className="accent-description-paragraph">{accentDescription}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
export default ResultCard;