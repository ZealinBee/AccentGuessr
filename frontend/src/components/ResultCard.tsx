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
    <div
      style={{
        background: "rgba(255,255,255,0.98)",
        padding: 14,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        display: "flex",
        gap: 12,
        alignItems: "center",
        flexDirection: "column",
        minWidth: 260,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 600 }}>Results</div>
      <div style={{ fontSize: 14 }}>
        Your guess was{" "}
        {answerDistance ? `${answerDistance.toFixed(3)} km` : "-"} away from the
        correct location
      </div>
      <div style={{ fontSize: 14 }}>Score: {score ?? "-"} / {maxScore}</div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={maxScore}
        aria-valuenow={typeof score === "number" ? Math.round(score) : 0}
        style={{
          width: "100%",
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            flex: 1,
            background: "#e6e9ef",
            height: 12,
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${percent}%`,
              height: "100%",
              background: "linear-gradient(90deg,#60a5fa,#2563eb)",
              transition: "width 400ms ease",
            }}
          />
        </div>

      </div>
      <button
        onClick={handleNext}
        style={{
          padding: "8px 14px",
          borderRadius: 8,
          border: "none",
          background: "#2563eb",
          color: "white",
          cursor: "pointer",
          fontSize: 16,
          marginTop: 6,
        }}
      >
        {gameRound < 4 ? "Next Round" : "Finish Game"}
      </button>
    </div>
  );
}

export default ResultCard;
