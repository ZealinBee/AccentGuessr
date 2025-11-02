import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import AudioPlayer from "./AudioPlayer";
import ResultCard from "./ResultCard";
import haversineKm from "../utils/haversineKm";
import { scoreCalculate } from "../utils/scoreCalculate";
import {
  point,
  booleanPointInPolygon,
  lineString,
  nearestPointOnLine,
  distance,
} from "@turf/turf";
import "mapbox-gl/dist/mapbox-gl.css";
import "../scss/Map.scss";
import { accentToFeature } from "../utils/accentToFeature";
import type { Match } from "../types/Match";
import LiveLeaderboard from "./LiveLeaderboard";
import { useMatchSocket } from "../hooks/useMatchWebSocket";

interface MultiplayerMapProps {
  roomState: Match;
  onGuessConfirmed?: (data: any) => void;
  playerId: number | null;
}

export default function MultiplayerMap({
  roomState,
  onGuessConfirmed,
  playerId,
}: MultiplayerMapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const playerMarkersRef = useRef<Map<number, mapboxgl.Marker>>(new Map());

  const [hasPin, setHasPin] = useState(false);
  const [confirmedAnswer, setConfirmedAnswer] = useState<{
    lng: number;
    lat: number;
  } | null>(null);
  const confirmedAnswerRef = useRef<{ lng: number; lat: number } | null>(null);
  const [answerDistance, setAnswerDistance] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);

  const markerColor = "#007bff"; // unified color for now
  const correctLocation =
    roomState.matchRounds[roomState.currentRound].speaker.accent;

  const { confirmGuess } = useMatchSocket(roomState.code, { onGuessConfirmed });

  useEffect(() => {
    confirmedAnswerRef.current = confirmedAnswer;
  }, [confirmedAnswer]);

  /** ─────────────────────────────
   * Draw all guesses when results available
   * ─────────────────────────────*/
  useEffect(() => {
    if (!mapRef.current || !roomState.matchRounds[roomState.currentRound])
      return;
    const map = mapRef.current;
    const round = roomState.matchRounds[roomState.currentRound];
    const guesses = round.guesses || [];

    const hasAnyScore = guesses.some((g) => g.score != null);
    if (!hasAnyScore) return;

    // Clear previous player markers and lines
    playerMarkersRef.current.forEach((m) => m.remove());
    playerMarkersRef.current.clear();

    for (const player of roomState.matchPlayers) {
      const lineId = `player-guess-line-${player.id}`;
      if (map.getLayer(lineId)) map.removeLayer(lineId);
      if (map.getSource(lineId)) map.removeSource(lineId);
    }

    // Add markers for each guess
    for (const guess of guesses) {
      const marker = new mapboxgl.Marker({ color: markerColor })
        .setLngLat([guess.guessLong, guess.guessLat])
        .addTo(map);
      playerMarkersRef.current.set(guess.playerId, marker);

      const isInside = booleanPointInPolygon(
        point([guess.guessLong, guess.guessLat]),
        accentToFeature(correctLocation)
      );

      if (!isInside) {
        const guessPt = point([guess.guessLong, guess.guessLat]);
        const regionFeature = accentToFeature(correctLocation);
        let closest = null;
        let minDist = Infinity;

        const checkRings = (rings: number[][][]) => {
          for (const ring of rings) {
            const line = lineString(ring);
            const snap = nearestPointOnLine(line, guessPt);
            const distVal = distance(guessPt, snap, { units: "kilometers" });
            if (distVal < minDist) {
              minDist = distVal;
              closest = snap;
            }
          }
        };

        if (regionFeature.geometry.type === "Polygon")
          checkRings(regionFeature.geometry.coordinates);
        else if (regionFeature.geometry.type === "MultiPolygon")
          for (const poly of regionFeature.geometry.coordinates)
            checkRings(poly);

        if (closest) {
          const lineId = `player-guess-line-${guess.playerId}`;
          map.addSource(lineId, {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [
                  [guess.guessLong, guess.guessLat],
                  closest.geometry.coordinates,
                ],
              },
            },
          });
          map.addLayer({
            id: lineId,
            type: "line",
            source: lineId,
            paint: {
              "line-color": markerColor,
              "line-width": 2,
              "line-dasharray": [2, 2],
            },
          });
        }
      }
    }

    // Draw correct region outline
    const regionSourceId = "correct-region";
    const regionLayerId = "correct-region-layer";
    const borderLayerId = "correct-region-border";

    if (map.getLayer(regionLayerId)) map.removeLayer(regionLayerId);
    if (map.getLayer(borderLayerId)) map.removeLayer(borderLayerId);
    if (map.getSource(regionSourceId)) map.removeSource(regionSourceId);

    const regionFeature = accentToFeature(correctLocation);
    map.addSource(regionSourceId, { type: "geojson", data: regionFeature });
    map.addLayer({
      id: regionLayerId,
      type: "fill",
      source: regionSourceId,
      paint: {
        "fill-color": "#1abc9c",
        "fill-opacity": 0.25,
        "fill-outline-color": "#16a085",
      },
    });
    map.addLayer({
      id: borderLayerId,
      type: "line",
      source: regionSourceId,
      paint: { "line-color": "#16a085", "line-width": 2 },
    });
  }, [
    roomState.matchRounds,
    roomState.currentRound,
    roomState.matchPlayers,
    correctLocation,
  ]);

  /** ─────────────────────────────
   * Map initialization + click handler
   * ─────────────────────────────*/
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
      zoom: 2.12,
    });

    mapRef.current = map;

    try {
      map.getCanvas().style.cursor = 'url("/cursor.png") 16 16, crosshair';
    } catch {}

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      if (confirmedAnswerRef.current) return;
      const { lng, lat } = e.lngLat;
      if (markerRef.current) markerRef.current.remove();

      const marker = new mapboxgl.Marker({ color: markerColor })
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

  /** ─────────────────────────────
   * Confirm guess
   * ─────────────────────────────*/
  const handleConfirm = () => {
    if (!markerRef.current || !playerId) return;
    const lngLat = markerRef.current.getLngLat();
    const answered = { lng: lngLat.lng, lat: lngLat.lat };
    setConfirmedAnswer(answered);

    const regionFeature = accentToFeature(correctLocation);
    const isInside = booleanPointInPolygon(
      point([answered.lng, answered.lat]),
      regionFeature
    );

    let totalDistance = 0;
    let roundScore = 0;

    if (isInside) {
      roundScore = 5000;
    } else {
      const guessPt = point([answered.lng, answered.lat]);
      let closest = null;
      let minDist = Infinity;

      const checkRings = (rings: number[][][]) => {
        for (const ring of rings) {
          const line = lineString(ring);
          const snap = nearestPointOnLine(line, guessPt);
          const distVal = distance(guessPt, snap, { units: "kilometers" });
          if (distVal < minDist) {
            minDist = distVal;
            closest = snap;
          }
        }
      };

      if (regionFeature.geometry.type === "Polygon")
        checkRings(regionFeature.geometry.coordinates);
      else if (regionFeature.geometry.type === "MultiPolygon")
        for (const poly of regionFeature.geometry.coordinates) checkRings(poly);

      if (closest) {
        totalDistance = haversineKm(
          answered.lat,
          answered.lng,
          closest.geometry.coordinates[1],
          closest.geometry.coordinates[0]
        );
        roundScore = scoreCalculate(answered.lat, answered.lng, regionFeature);
      }
    }

    setAnswerDistance(totalDistance);
    setScore(roundScore);
    confirmGuess(answered.lng, answered.lat, roundScore, playerId);
  };

  /** ─────────────────────────────
   * Reset for next round
   * ─────────────────────────────*/
  const handleNext = () => {
    if (markerRef.current) markerRef.current.remove();
    playerMarkersRef.current.forEach((m) => m.remove());
    playerMarkersRef.current.clear();

    const map = mapRef.current;
    if (map) {
      ["correct-region-layer", "correct-region-border"].forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      if (map.getSource("correct-region")) map.removeSource("correct-region");
    }

    setHasPin(false);
    setConfirmedAnswer(null);
    setAnswerDistance(null);
    setScore(null);
  };

  return (
    <div className="map-wrapper">
      <div id="map-container" ref={mapContainerRef} />

      <LiveLeaderboard roomState={roomState} playerId={playerId} />

      <div className="round-indicator">
        Round {roomState.currentRound + 1}/5
      </div>

      <div className="bottom-controls">
        {!confirmedAnswer ? (
          <div className="guess-section">
            <AudioPlayer
              srcs={roomState.matchRounds[roomState.currentRound].speaker.clips}
            />
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
            gameRound={roomState.currentRound}
            handleNext={handleNext}
            accentName={
              roomState.matchRounds[roomState.currentRound].speaker.accent.name
            }
            accentDescription={
              roomState.matchRounds[roomState.currentRound].speaker.accent
                .description
            }
          />
        )}
      </div>
    </div>
  );
}
