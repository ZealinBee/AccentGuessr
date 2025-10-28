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
  const [volume, setVolume] = useState<number>(1);
  const [index, setIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const currentSrc = srcs && srcs.length > 0 ? srcs[index].audioUrl : "";

  const resetForIndexChange = useCallback(() => {
    const a = audioRef.current;
    setPlaying(false);
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

    const onEnded = () => setPlaying(false);
    const onLoadStart = () => setLoading(true);
    const onCanPlay = () => setLoading(false);
    const onError = () => setLoading(false);

    a.addEventListener("ended", onEnded);
    a.addEventListener("loadstart", onLoadStart);
    a.addEventListener("canplay", onCanPlay);
    a.addEventListener("error", onError);

    // ensure the element tries to load metadata for the new src
    try {
      setLoading(true);
      a.load();
    } catch {
      setLoading(false);
    }

    return () => {
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("loadstart", onLoadStart);
      a.removeEventListener("canplay", onCanPlay);
      a.removeEventListener("error", onError);
    };
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
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={24} className="spinner" />
            ) : playing ? (
              <Pause size={24} fill="white" />
            ) : (
              <Play size={24} fill="white" />
            )}
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

      <audio ref={audioRef} src={currentSrc} preload="metadata" />
    </div>
  );


}