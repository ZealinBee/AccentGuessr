import { useState, useEffect, useRef } from "react";
import { Play, Square, Info } from "lucide-react";
import "../scss/ResultCard.scss";
import type { Clip } from "../types/Clip";

interface ResultCardProps {
  answerDistance: number;
  score: number;
  baseScore?: number;
  gameRound: number;
  handleNext: () => void;
  accentName: string;
  accentDescription: string;
  audioClipUrl?: Clip;
  percentile: number | null;
  onOpenModal: () => void;
  difficulty?: number;
}

function ResultCard({
  answerDistance,
  score,
  gameRound,
  handleNext,
  accentName,
  accentDescription,
  audioClipUrl,
  percentile,
  onOpenModal,
  difficulty,
}: ResultCardProps) {
  const maxScore = 5000;
  const safeScore = typeof score === "number" ? score : 0;

  const scorePercent = Math.max(0, Math.min(100, (safeScore / maxScore) * 100));

  const [isPlaying, setIsPlaying] = useState(false);
  const [showDifficultyTooltip, setShowDifficultyTooltip] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getDifficultyInfo = (difficultyScore: number) => {
    if (difficultyScore < 1000) {
      return { label: "Extremely Difficult", color: "#7c2d12", bgColor: "#fef2f2" };
    } else if (difficultyScore < 2000) {
      return { label: "Difficult", color: "#b91c1c", bgColor: "#fef2f2" };
    } else if (difficultyScore < 3000) {
      return { label: "Medium", color: "#d97706", bgColor: "#fffbeb" };
    } else if (difficultyScore < 4000) {
      return { label: "Easy", color: "#059669", bgColor: "#f0fdf4" };
    } else {
      return { label: "Very Easy", color: "#047857", bgColor: "#f0fdf4" };
    }
  };

  const togglePlay = async () => {
    const a = audioRef.current;
    if (!a || !audioClipUrl) return;

    if (!a.paused) {
      a.pause();
      setIsPlaying(false);
    } else {
      try {
        await a.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn("Playback failed:", err);
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onEnded = () => setIsPlaying(false);
    const onPause = () => setIsPlaying(false);

    a.addEventListener("ended", onEnded);
    a.addEventListener("pause", onPause);

    return () => {
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("pause", onPause);
    };
  }, []);

  return (
    <>
      <div className="result-card">
        <div className="result-card-header">
          {difficulty !== undefined && difficulty !== null && (
            <div className="difficulty-badge-container">
              <div
                className="difficulty-badge"
                style={{
                  backgroundColor: getDifficultyInfo(difficulty).bgColor,
                  color: getDifficultyInfo(difficulty).color,
                }}
              >
                {getDifficultyInfo(difficulty).label}
              </div>
              <button
                className="difficulty-info-btn"
                onClick={() => setShowDifficultyTooltip(!showDifficultyTooltip)}
                aria-label="Difficulty information"
              >
                <Info size={14} />
              </button>
              {showDifficultyTooltip && (
                <div className="difficulty-tooltip">
                  The difficulty is calculated by the median score other people get for this speaker
                </div>
              )}
            </div>
          )}
          <div className="title-row">
            <div className="result-title">{accentName}</div>
            {audioClipUrl && (
              <button
                onClick={togglePlay}
                className="play-icon-btn"
                aria-label={isPlaying ? "Stop audio" : "Play audio"}
              >
                {isPlaying ? <Square size={18} /> : <Play size={18} />}
              </button>
            )}
          </div>

          <div className="result-text">
            {score === 5000 ? (
              <>Perfect! You nailed it exactly!</>
            ) : (
              <>Your guess was {answerDistance?.toLocaleString()} km away</>
            )}
          </div>

          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={maxScore}
            aria-valuenow={typeof score === "number" ? Math.round(score) : 0}
            className="progress-container"
          >
            <div className="score-text">
              Score: {score ?? "-"} / {maxScore}
              {percentile !== null && (
                <span className="percentile-inline">
                  {" "}
                  ({percentile}th percentile)
                </span>
              )}
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${scorePercent}%` }} />
            </div>
          </div>

          <button onClick={handleNext} className="next-button">
            {gameRound < 4 ? "Next Round" : "Finish Game"}
          </button>

          {accentDescription && (
            <button
              onClick={onOpenModal}
              className="learn-more-link"
            >
              <Info size={14} />
              Learn about this accent
            </button>
          )}
        </div>
      </div>

      {audioClipUrl && (
        <audio ref={audioRef} src={audioClipUrl.audioUrl} preload="metadata" />
      )}
    </>
  );
}

export default ResultCard;
