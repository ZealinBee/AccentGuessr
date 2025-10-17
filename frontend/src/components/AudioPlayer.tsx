import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import "../scss/AudioPlayer.scss";
import type { Clip } from "../types/Clip";

type AudioPlayerProps = {
  srcs: Clip[];
};

export default function AudioPlayer({ srcs }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [index, setIndex] = useState<number>(0);

  const currentSrc = srcs && srcs.length > 0 ? srcs[index].audioUrl : "";

  const resetForIndexChange = useCallback(() => {
    const a = audioRef.current;
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setLoading(true);
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
  }, []);

  // If the available srcs change, ensure index is in range and reset player state
  useEffect(() => {
    if (!srcs || srcs.length === 0) {
      setIndex(0);
      resetForIndexChange();
      return;
    }
    if (index > srcs.length - 1) {
      setIndex(0);
      resetForIndexChange();
    }
  }, [srcs, index, resetForIndexChange]);

  const togglePlay = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return;
    // use the element's paused state to avoid depending on React 'playing'
    if (!a.paused) {
      a.pause();
      setPlaying(false);
    } else {
      try {
        await a.play();
        setPlaying(true);
      } catch (err) {
        console.warn("Playback failed:", err);
        setPlaying(false);
      }
    }
  }, []);

  const prevClip = useCallback(() => {
    if (!srcs || srcs.length === 0) return;
    setIndex((i) => {
      const next = Math.max(0, i - 1);
      resetForIndexChange();
      return next;
    });
  }, [srcs, resetForIndexChange]);

  const nextClip = useCallback(() => {
    if (!srcs || srcs.length === 0) return;
    setIndex((i) => {
      const next = Math.min(srcs.length - 1, i + 1);
      resetForIndexChange();
      return next;
    });
  }, [srcs, resetForIndexChange]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onLoaded = () => {
      setDuration(a.duration || 0);
      setLoading(false);
    };

    const onTime = () => setCurrentTime(a.currentTime || 0);
    const onEnded = () => setPlaying(false);
    const onError = () => setLoading(false);

    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnded);
    a.addEventListener("error", onError);

    // ensure the element tries to load metadata for the new src
    try {
      setLoading(true);
      a.load();
    } catch {
      // ignore
    }

    return () => {
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("error", onError);
    };
    // re-run when the current source changes so listeners reflect the right element state
  }, [currentSrc]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
  }, [volume]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
      if (e.code === "ArrowLeft") {
        e.preventDefault();
        prevClip();
      }
      if (e.code === "ArrowRight") {
        e.preventDefault();
        nextClip();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePlay, prevClip, nextClip]);

  const seekTo = (time: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(time, duration || 0));
    setCurrentTime(a.currentTime);
  };

  const formatTime = (seconds: number) => {
    // guard negative/NaN
    if (!isFinite(seconds) || seconds <= 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="audio-player">
      <div className="controls-row">
        <div className="nav-arrows">
          <button
            onClick={prevClip}
            aria-label="Previous clip"
            className="arrow-button"
            disabled={index <= 0}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
            className="play-button"
          >
            {playing ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
          </button>
          <button
            onClick={nextClip}
            aria-label="Next clip"
            className="arrow-button"
            disabled={index >= srcs.length - 1}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="volume-control">
          <div className="volume-icon">
            {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="volume-slider"
          />
          <span className="volume-text">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-bar-container">
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(0, duration)}
            step={0.01}
            value={currentTime}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="progress-slider"
          />
        </div>

        <div className="time-display">
          <span className="current-time">{formatTime(currentTime)}</span>
          {loading ? (
            <div className="loading-indicator">
              <Loader2 size={14} className="spinner" />
              <span>Loading...</span>
            </div>
          ) : (
            <span className="duration">{formatTime(duration)}</span>
          )}
        </div>
      </div>

      <audio ref={audioRef} src={currentSrc} preload="metadata" />
    </div>
  );


}