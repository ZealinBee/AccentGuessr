import "../scss/ResultCard.scss";

interface ResultCardProps {
  answerDistance: number;
  score: number;
  gameRound: number;
  handleNext: () => void;
}

function ResultCard({
  answerDistance,
  score,
  gameRound,
  handleNext,
}: ResultCardProps) {
  const maxScore = 5000;
  const safeScore = typeof score === "number" ? score : 0;
  const percent = Math.max(0, Math.min(100, (safeScore / maxScore) * 100));

  return (
    <>
      <div className="result-card">
        <div className="result-title">Results</div>

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
      </div>
    </>
  );
}
export default ResultCard;
