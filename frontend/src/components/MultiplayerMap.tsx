import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import AudioPlayer from "./AudioPlayer";
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
import MultiplayerResultCard from "./MultiplayerResultCard";

interface MultiplayerMapProps {
  roomState: Match;
  onGuessConfirmed?: (data: Match) => void;
  playerId: number | null;
  onRoundStarted?: (data: Match) => void;
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

  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    confirmedAnswerRef.current = confirmedAnswer;
  }, [confirmedAnswer]);

  // Timer based on phaseEndsAt from backend

  const { confirmGuess } = useMatchSocket(roomState.code, {
    onGuessConfirmed,
    onMatchFinished: onGuessConfirmed,
    onNewRound: (updatedMatch) => {
      console.log("New round started, cleaning up");

      // Reset all state
      setHasPin(false);
      setConfirmedAnswer(null);
      setAnswerDistance(null);
      setScore(null);

      // Remove player's own marker
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }

      // Clear all player markers
      playerMarkersRef.current.forEach((marker) => marker.remove());
      playerMarkersRef.current.clear();

      // Clear map layers and sources
      if (mapRef.current) {
        const map = mapRef.current;

        // Remove guess lines for all players
        for (const player of roomState.matchPlayers) {
          const lineId = `player-guess-line-${player.id}`;
          if (map.getLayer(lineId)) map.removeLayer(lineId);
          if (map.getSource(lineId)) map.removeSource(lineId);
        }

        // Remove region layers
        const regionSourceId = "correct-region";
        const regionLayerId = "correct-region-layer";
        const borderLayerId = "correct-region-border";

        if (map.getLayer(regionLayerId)) map.removeLayer(regionLayerId);
        if (map.getLayer(borderLayerId)) map.removeLayer(borderLayerId);
        if (map.getSource(regionSourceId)) map.removeSource(regionSourceId);
      }
    },
  });

  useEffect(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Only run timer during guessing phase
    if (roomState.phase !== "guessing" || !roomState.phaseEndsAt) {
      setTimeRemaining(0);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = Date.now();
      const endsAt = new Date(roomState.phaseEndsAt!).getTime();
      const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));
      return remaining;
    };

    // Set initial time
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    timerRef.current = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      // Auto-submit when time runs out
      if (remaining <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Auto-submit if player hasn't confirmed yet
        if (!confirmedAnswerRef.current && playerId) {
          const accent =
            roomState.matchRounds[roomState.currentRound].speaker.accent;

          if (markerRef.current) {
            const lngLat = markerRef.current.getLngLat();
            const regionFeature = accentToFeature(accent);
            const roundScore = scoreCalculate(
              lngLat.lat,
              lngLat.lng,
              regionFeature as never
            );
            confirmGuess(lngLat.lng, lngLat.lat, roundScore);
          } else {
            confirmGuess(0, 0, 0);
          }
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    roomState.phase,
    roomState.phaseEndsAt,
    roomState.currentRound,
    roomState.matchRounds,
    playerId,
    confirmGuess,
  ]);

  useEffect(() => {
    if (!mapRef.current || !roomState.matchRounds[roomState.currentRound])
      return;
    const map = mapRef.current;
    const round = roomState.matchRounds[roomState.currentRound];
    const guesses = round.guesses || [];

    // Show current player's guess immediately, show all when resolved
    const shouldShowAll = round.isResolved;
    const currentPlayerGuess = guesses.find((g) => g.playerId === playerId);

    // If not resolved and current player hasn't guessed yet, don't show anything
    if (!shouldShowAll && !currentPlayerGuess) return;

    // Clear previous player markers and lines
    playerMarkersRef.current.forEach((m) => m.remove());
    playerMarkersRef.current.clear();

    for (const player of roomState.matchPlayers) {
      const lineId = `player-guess-line-${player.id}`;
      if (map.getLayer(lineId)) map.removeLayer(lineId);
      if (map.getSource(lineId)) map.removeSource(lineId);
    }

    // Add markers for each guess
    const guessesToShow = shouldShowAll
      ? guesses
      : currentPlayerGuess
      ? [currentPlayerGuess]
      : [];

    for (const guess of guessesToShow) {
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
              properties: {},
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
    playerId,
  ]);

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
    } catch {
      // Ignore cursor errors
    }

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

  const handleConfirm = () => {
    if (!markerRef.current || !playerId || !mapRef.current) return;
    const map = mapRef.current;
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
    let closest: any = null;

    if (isInside) {
      roundScore = 5000;
    } else {
      const guessPt = point([answered.lng, answered.lat]);
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
        roundScore = scoreCalculate(
          answered.lat,
          answered.lng,
          regionFeature as never
        );
      }
    }

    setAnswerDistance(totalDistance);
    setScore(roundScore);

    // *** IMMEDIATELY draw the correct region ***
    const regionSourceId = "correct-region";
    const regionLayerId = "correct-region-layer";
    const borderLayerId = "correct-region-border";

    if (map.getLayer(regionLayerId)) map.removeLayer(regionLayerId);
    if (map.getLayer(borderLayerId)) map.removeLayer(borderLayerId);
    if (map.getSource(regionSourceId)) map.removeSource(regionSourceId);

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

    // *** IMMEDIATELY draw the line if outside the region ***
    if (!isInside && closest) {
      const lineId = `player-guess-line-${playerId}`;
      if (map.getLayer(lineId)) map.removeLayer(lineId);
      if (map.getSource(lineId)) map.removeSource(lineId);

      map.addSource(lineId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [answered.lng, answered.lat],
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

    confirmGuess(answered.lng, answered.lat, roundScore);
  };

  return (
    <div className="map-wrapper">
      <div id="map-container" ref={mapContainerRef} />

      <LiveLeaderboard roomState={roomState} playerId={playerId} />

      {!roomState.matchRounds[roomState.currentRound]?.isResolved && (
        <div
          className={`timer-display ${timeRemaining <= 10 ? "warning" : ""}`}
        >
          {Math.floor(timeRemaining / 60)}:
          {(timeRemaining % 60).toString().padStart(2, "0")}
        </div>
      )}

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
          <>
            {/* Show result immediately after confirming */}
            <MultiplayerResultCard
              answerDistance={answerDistance ?? 0}
              score={score ?? 0}
              accentName={
                roomState.matchRounds[roomState.currentRound].speaker.accent
                  .name
              }
              isResolved={
                roomState.matchRounds[roomState.currentRound].isResolved
              }
              phase={roomState.phase}
              phaseEndsAt={roomState.phaseEndsAt}
            />
            {/* Show waiting message only if round not resolved yet amd is still guessing */}
            {!roomState.matchRounds[roomState.currentRound].isResolved &&
              roomState.phase === "guessing" && (
                <div className="waiting-section">
                  <p>Waiting for other players to finish...</p>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}
