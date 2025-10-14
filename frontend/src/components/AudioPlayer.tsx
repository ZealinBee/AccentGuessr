import{ useEffect, useRef, useState } from "react";

type Props = {
  src?: string;
};


export default function AudioPlayer({
  src = "/testAudios/audio1.m4a",
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

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

    return () => {
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("error", onError);
    };
  }, [src]);

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
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const togglePlay = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
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
  };

  const seekTo = (time: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(time, duration || 0));
    setCurrentTime(a.currentTime);
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, maxWidth: 520, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
          {playing ? "❚❚" : "►"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 12 }}>Volume</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
          <div style={{ fontSize: 12, width: 44, textAlign: "right" }}>{Math.round(volume * 100)}%</div>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="range"
            min={0}
            max={Math.max(0, duration)}
            step={0.01}
            value={currentTime}
            onChange={(e) => seekTo(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 6 }}>
          <div>
         {loading && <span>• loading</span>}
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={src} preload="metadata" />
    </div>
  );
}
