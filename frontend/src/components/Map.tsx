import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import AudioPlayer from "./AudioPlayer";
import ResultCard from "./ResultCard";
import InstructionCard from "./InstructionCard";
import haversineKm from "../utils/haversineKm";
import { scoreCalculate } from "../utils/scoreCalculate";
import type { Speaker } from "../types/Speaker";

import "mapbox-gl/dist/mapbox-gl.css";
import "../scss/Map.scss";

interface MapProps {
  roundData: Speaker;
  gameRound: number;
  setGameStarted: (started: boolean) => void;
  setGameRound: (n: number) => void;
}

function Map({ roundData, gameRound, setGameRound, setGameStarted }: MapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const correctMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [hasPin, setHasPin] = useState(false);
  const [confirmedAnswer, setConfirmedAnswer] = useState<{
    lng: number;
    lat: number;
  } | null>(null);
  const confirmedAnswerRef = useRef<{ lng: number; lat: number } | null>(null);
  const [answerDistance, setAnswerDistance] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const correctLocation = { lng: roundData.lng, lat: roundData.lat };

  useEffect(() => {
    confirmedAnswerRef.current = confirmedAnswer;
  }, [confirmedAnswer]);

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as
      | string
      | undefined;
    if (token) mapboxgl.accessToken = token;

    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-74.0242, 40.6941],
      zoom: 3.12,
    });

    mapRef.current = map;

    try {
      map.getCanvas().style.cursor = "crosshair";
    } catch {
      // ignore
    }

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      if (confirmedAnswerRef.current) return;
      const { lng, lat } = e.lngLat;

      if (markerRef.current) markerRef.current.remove();

      const marker = new mapboxgl.Marker({ color: "#e74c3c" })
        .setLngLat([lng, lat])
        .addTo(map);
      markerRef.current = marker;
      setHasPin(true);
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
      if (markerRef.current) markerRef.current.remove();
      map.remove();
    };
  }, []);

  const handleConfirm = () => {
    if (!markerRef.current) return;
    const lngLat = markerRef.current.getLngLat();
    const answered = { lng: lngLat.lng, lat: lngLat.lat };

    setConfirmedAnswer(answered);

    const distanceKm = haversineKm(
      answered.lat,
      answered.lng,
      correctLocation.lat,
      correctLocation.lng
    );
    setAnswerDistance(distanceKm);
    const computedScore = scoreCalculate(distanceKm);
    setScore(computedScore);

    const map = mapRef.current;
    if (!map) return;

    if (correctMarkerRef.current) correctMarkerRef.current.remove();
    const correctMarker = new mapboxgl.Marker({ color: "#23e200" })
      .setLngLat([correctLocation.lng, correctLocation.lat])
      .addTo(map);
    correctMarkerRef.current = correctMarker;

    const lineId = "answer-line";
    const lineGeo: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [answered.lng, answered.lat],
              [correctLocation.lng, correctLocation.lat],
            ],
          },
          properties: {},
        },
      ],
    };

    if (map.getSource(lineId)) {
      (map.getSource(lineId) as mapboxgl.GeoJSONSource).setData(lineGeo);
    } else {
      map.addSource(lineId, { type: "geojson", data: lineGeo });
      map.addLayer({
        id: lineId,
        type: "line",
        source: lineId,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "black",
          "line-width": 3,
          "line-opacity": 0.8,
          "line-dasharray": [2, 2],
        },
      });
    }
  };

  const handleNext = () => {
    if (markerRef.current) markerRef.current.remove();
    if (correctMarkerRef.current) correctMarkerRef.current.remove();

    const map = mapRef.current;
    const lineId = "answer-line";
    if (map) {
      if (map.getLayer(lineId)) map.removeLayer(lineId);
      if (map.getSource(lineId)) map.removeSource(lineId);
    }

    setHasPin(false);
    setConfirmedAnswer(null);
    setAnswerDistance(null);
    setScore(null);

    if (gameRound >= 4) setGameStarted(false);
    else setGameRound(gameRound + 1);
  };

  return (
    <div className="map-wrapper">
      <div id="map-container" ref={mapContainerRef} />
      <InstructionCard />
      <div
        className="round-indicator"
        aria-label={`Round ${gameRound + 1} of 5`}
      >
        Round {gameRound + 1}/5
      </div>
      <div className="bottom-controls">
        {!confirmedAnswer ? (
          <div className="guess-section">
            <AudioPlayer srcs={roundData.clips} />
            <button
              className={`confirm-btn ${hasPin ? "active" : "disabled"}`}
              onClick={handleConfirm}
              disabled={!hasPin}
            >
              Confirm Guess
            </button>
          </div>
        ) : (
          <ResultCard
            answerDistance={answerDistance ?? 0}
            score={score ?? 0}
            gameRound={gameRound}
            handleNext={handleNext}
          />
        )}
      </div>
    </div>
  );
}

export default Map;
