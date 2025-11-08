import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import "../scss/ResultCard.scss";
import type { Clip } from "../types/Clip";

interface ResultCardProps {
  answerDistance: number;
  score: number;
  gameRound: number;
  handleNext: () => void;
  accentName: string;
  accentDescription: string;
  audioClipUrl?: Clip;
}

function ResultCard({
  answerDistance,
  score,
  gameRound,
  handleNext,
  accentName,
  accentDescription,
  audioClipUrl,
}: ResultCardProps) {
  const maxScore = 5000;
  const safeScore = typeof score === "number" ? score : 0;
  const percent = Math.max(0, Math.min(100, (safeScore / maxScore) * 100));
  const [showDetails, setShowDetails] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // all this to make scrolling up on mobile not cook up and refresh
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    const prevBodyOverscroll = body.style.overscrollBehavior;

    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";

    let startY = 0;
    let startTargetScrollable: HTMLElement | null = null;

    function findScrollable(el: Element | null): HTMLElement | null {
      while (el && el !== document.body && el !== document.documentElement) {
        const style = window.getComputedStyle(el);
        const overflowY = style.overflowY;
        if (
          (overflowY === "auto" ||
            overflowY === "scroll" ||
            overflowY === "overlay") &&
          (el as HTMLElement).scrollHeight > (el as HTMLElement).clientHeight
        ) {
          return el as HTMLElement;
        }
        el = el.parentElement;
      }
      return null;
    }

    function onTouchStart(e: TouchEvent) {
      startY = e.touches && e.touches.length ? e.touches[0].clientY : 0;
      startTargetScrollable = findScrollable(e.target as Element | null);
    }

    function onTouchMove(e: TouchEvent) {
      const curY = e.touches && e.touches.length ? e.touches[0].clientY : 0;
      const diff = curY - startY;

      if (diff > 0) {
        if (!startTargetScrollable) {
          if (window.scrollY === 0) {
            e.preventDefault();
          }
        }
      }
    }

    document.addEventListener("touchstart", onTouchStart, {
      passive: true,
    } as EventListenerOptions);
    document.addEventListener("touchmove", onTouchMove, {
      passive: false,
    } as EventListenerOptions);

    return () => {
      html.style.overscrollBehavior = prevHtmlOverscroll;
      body.style.overscrollBehavior = prevBodyOverscroll;
      document.removeEventListener(
        "touchstart",
        onTouchStart as EventListenerOrEventListenerObject
      );
      document.removeEventListener(
        "touchmove",
        onTouchMove as EventListenerOrEventListenerObject
      );
    };
  }, []);

  return (
    <>
      <div className="result-card-container">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="collapse-toggle-button"
          aria-label={isCollapsed ? "Expand result card" : "Collapse result card"}
        >
          {isCollapsed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {!isCollapsed && (
          <div className={`result-card ${showDetails ? "expanded" : ""}`}>
            <div className="result-card-header">
              <div className="result-title">Accent: {accentName}</div>
              {audioClipUrl && (
                <div className="result-card-play-voice-again">
                  <button onClick={togglePlay}>
                    {isPlaying ? "Stop Playing" : "Play the Voice Again"}
                  </button>
                </div>
              )}

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
                  <p className="accent-description-paragraph">
                    {accentDescription}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {audioClipUrl && (
        <audio
          ref={audioRef}
          src={audioClipUrl.audioUrl}
          preload="metadata"
        />
      )}
    </>
  );
}
export default ResultCard;
