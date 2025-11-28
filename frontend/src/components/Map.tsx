'use client'

import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { X } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
import ResultCard from "./ResultCard";
import InstructionCard from "./InstructionCard";
import haversineKm from "../utils/haversineKm";
import { scoreCalculate } from "../utils/scoreCalculate";
import type { Speaker } from "../types/Speaker";
import {
  point,
  booleanPointInPolygon,
  lineString,
  nearestPointOnLine,
  distance,
} from "@turf/turf";
import { env } from "@/lib/env";

import "mapbox-gl/dist/mapbox-gl.css";
import "../scss/Map.scss";
import { accentToFeature } from "../utils/accentToFeature";
import { useGame } from "../hooks/useGame";

// Placeholder Ad Component (for preview until AdSense is approved)
// const PlaceholderAd = () => {
//   return (
//     <div className="placeholder-ad">
//       <div className="placeholder-ad-label">Advertisement</div>
//       <div className="placeholder-ad-content">
//         <div className="placeholder-ad-text">
//           <strong>AdSense Preview</strong>
//           <p>Your ad will appear here</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// Google AdSense Ad Component
const MapAd = () => {
  useEffect(() => {
    try {
      // Initialize AdSense ad
      const w = window as Window & { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <>
      {/* Show placeholder during development/testing */}
      {/* {import.meta.env.DEV && <PlaceholderAd />} */}

      {/* Real AdSense ad */}
      <ins
        className="adsbygoogle map-ad"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1290357879552342"
        data-ad-slot="9909999826"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </>
  );
};

interface MapProps {
  roundData: Speaker;
}

export type MapCoreRef = {
  showRegion: (regionFeature: any) => void;
  showResultLine: (from: { lng: number; lat: number }, to: { lng: number; lat: number }) => void;
  clearOverlays: () => void;
  clearMarker: () => void;
  setMarker: (lng: number, lat: number) => void;

}

function Map({ roundData }: MapProps) {
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
  const [percentile, setPercentile] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { nextRound, pushRoundResult, gameRound } = useGame();

  const correctLocation = roundData.accent;

  useEffect(() => {
    confirmedAnswerRef.current = confirmedAnswer;
  }, [confirmedAnswer]);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    const token = env.MAPBOX_ACCESS_TOKEN;
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
      try {
        if (map && typeof map.off === 'function') {
          map.off("click", handleClick);
        }
        if (markerRef.current && typeof markerRef.current.remove === 'function') {
          markerRef.current.remove();
          markerRef.current = null;
        }
        if (correctMarkerRef.current && typeof correctMarkerRef.current.remove === 'function') {
          correctMarkerRef.current.remove();
          correctMarkerRef.current = null;
        }
        if (mapRef.current && typeof mapRef.current.remove === 'function') {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch (error) {
        // Ignore cleanup errors - DOM might already be removed
        console.warn('Map cleanup error:', error);
      }
    };
  }, []);

  const handleConfirm = () => {
    if (!markerRef.current) return;
    const lngLat = markerRef.current.getLngLat();
    const answered = { lng: lngLat.lng, lat: lngLat.lat };

    setConfirmedAnswer(answered);

    const isInside = booleanPointInPolygon(
      point([answered.lng, answered.lat]),
      accentToFeature(correctLocation)
    );

    // Draw the correct region as a transparent polygon with border
    const map = mapRef.current;
    if (map) {
      const regionSourceId = "correct-region";
      const regionLayerId = "correct-region-layer";
      // Remove previous if exists
      if (map.getLayer(regionLayerId)) map.removeLayer(regionLayerId);
      if (map.getSource(regionSourceId)) map.removeSource(regionSourceId);

      const regionFeature = accentToFeature(correctLocation);
      map.addSource(regionSourceId, {
        type: "geojson",
        data: regionFeature,
      });
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
      // Optionally, add a border line for more visible border
      const borderLayerId = "correct-region-border";
      if (map.getLayer(borderLayerId)) map.removeLayer(borderLayerId);
      map.addLayer({
        id: borderLayerId,
        type: "line",
        source: regionSourceId,
        paint: {
          "line-color": "#16a085",
          "line-width": 2,
        },
      });
    }
    let roundScore = 0;
    let totalDistance = 0;
    if (isInside) {
      totalDistance = 0;
      setAnswerDistance(totalDistance);
      roundScore = 5000;
    } else {
      // Find closest point on the polygon border
      const guessPt = point([answered.lng, answered.lat]);
      const regionFeature = accentToFeature(correctLocation);
      let closest;
      if (regionFeature.geometry.type === "Polygon") {
        // For Polygon, check each ring
        let minDist = Infinity;
        let minPt = null;
        for (const ring of regionFeature.geometry.coordinates) {
          const line = lineString(ring);
          const snap = nearestPointOnLine(line, guessPt);
          const distVal = distance(guessPt, snap, { units: "kilometers" });
          if (distVal < minDist) {
            minDist = distVal;
            minPt = snap;
          }
        }
        closest = minPt;
      } else if (regionFeature.geometry.type === "MultiPolygon") {
        let minDist = Infinity;
        let minPt = null;
        for (const poly of regionFeature.geometry.coordinates) {
          for (const ring of poly) {
            const line = lineString(ring);
            const snap = nearestPointOnLine(line, guessPt);
            const distVal = distance(guessPt, snap, { units: "kilometers" });
            if (distVal < minDist) {
              minDist = distVal;
              minPt = snap;
            }
          }
        }
        closest = minPt;
      }

      // Compute distance and score
      if (closest) {
        const borderLngLat = {
          lng: closest.geometry.coordinates[0],
          lat: closest.geometry.coordinates[1],
        };
        totalDistance = haversineKm(
          answered.lat,
          answered.lng,
          borderLngLat.lat,
          borderLngLat.lng
        );
        roundScore = scoreCalculate(
          answered.lat,
          answered.lng,
          regionFeature as any
        );
        setAnswerDistance(totalDistance);
      }

      // Draw a dotted line from guess to closest border point
      if (closest && mapRef.current) {
        const map = mapRef.current;
        const lineId = "guess-to-border";
        if (map.getLayer(lineId)) map.removeLayer(lineId);
        if (map.getSource(lineId)) map.removeSource(lineId);
        map.addSource(lineId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [answered.lng, answered.lat],
                closest.geometry.coordinates,
              ],
            },
            properties: {},
          },
        });
        map.addLayer({
          id: lineId,
          type: "line",
          source: lineId,
          paint: {
            "line-color": "#e67e22",
            "line-width": 3,
            "line-dasharray": [2, 2],
          },
        });
      }
    }

    setScore(roundScore);

    pushRoundResult({
      score: roundScore,
      guessLong: answered.lng,
      guessLat: answered.lat,
      speakerId: roundData.id,
    });

    // Fetch percentile from backend
    fetch(
      `${env.API_URL}/games/percentile?speakerId=${roundData.id}&score=${roundScore}`
    )
      .then((res) => res.json())
      .then((data) => setPercentile(data.percentile))
      .catch((err) => console.error("Failed to fetch percentile:", err));
  };

  const handleNext = () => {
    if (markerRef.current) markerRef.current.remove();
    if (correctMarkerRef.current) correctMarkerRef.current.remove();

    const map = mapRef.current;
    if (map) {
      // Remove region polygon and border
      const regionLayerId = "correct-region-layer";
      const regionSourceId = "correct-region";
      const borderLayerId = "correct-region-border";
      if (map.getLayer(regionLayerId)) map.removeLayer(regionLayerId);
      if (map.getLayer(borderLayerId)) map.removeLayer(borderLayerId);
      if (map.getSource(regionSourceId)) map.removeSource(regionSourceId);
      // Remove guess-to-border line
      const guessLineId = "guess-to-border";
      if (map.getLayer(guessLineId)) map.removeLayer(guessLineId);
      if (map.getSource(guessLineId)) map.removeSource(guessLineId);
    }

    setHasPin(false);
    setConfirmedAnswer(null);
    setAnswerDistance(null);
    setScore(null);
    setPercentile(null);
    setShowModal(false);

    nextRound();
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
            accentName={roundData.accent.name}
            accentDescription={roundData.accent.description}
            audioClipUrl={roundData.clips[0]}
            percentile={percentile}
            onOpenModal={() => setShowModal(true)}
            difficulty={roundData.medianScore}
          />
        )}
      </div>

      {/* Ad container at bottom of map */}
      <div className="map-ad-container">
        <MapAd />
      </div>

      {/* Modal for accent description */}
      {showModal && (
        <div className="result-card-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="result-card-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="result-card-modal-header">
              <h3>About the {roundData.accent.name} Accent</h3>
              <button
                onClick={() => setShowModal(false)}
                className="result-card-modal-close"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>
            <div className="result-card-modal-body">
              <p>{roundData.accent.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Map;
