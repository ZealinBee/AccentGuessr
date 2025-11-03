import { useEffect, useState } from "react";
import "../scss/MultiplayerResultCard.scss";

interface ResultCardProps {
  answerDistance: number;
  score: number;
  accentName: string;
  isResolved: boolean;
  phase: string;
  phaseEndsAt: string | null;
}

function MultiplayerResultCard({
  answerDistance,
  score,
  accentName,
  isResolved,
  phase,
  phaseEndsAt,
}: ResultCardProps) {
  const maxScore = 5000;
  const safeScore = typeof score === "number" ? score : 0;
  const percent = Math.max(0, Math.min(100, (safeScore / maxScore) * 100));

  const [nextRoundCountdown, setNextRoundCountdown] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (isResolved && phase === "post_results" && phaseEndsAt) {
      const calculateTimeRemaining = () => {
        const now = Date.now();
        const endsAt = new Date(phaseEndsAt).getTime();
        const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));
        return remaining;
      };

      setNextRoundCountdown(calculateTimeRemaining());

      const interval = setInterval(() => {
        const remaining = calculateTimeRemaining();
        setNextRoundCountdown(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
          setNextRoundCountdown(null);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setNextRoundCountdown(null);
    }
  }, [isResolved, phase, phaseEndsAt]);

  return (
    <>
      <div className={`result-card`}>
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
          {isResolved && nextRoundCountdown !== null && (
            <div className="next-round-countdown">
              Next round in {nextRoundCountdown}...
            </div>
          )}
        </div>
      </div>
    </>
  );
}
export default MultiplayerResultCard;
