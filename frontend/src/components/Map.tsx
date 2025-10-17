import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import AudioPlayer from "./AudioPlayer";

import "mapbox-gl/dist/mapbox-gl.css";

import "../scss/Map.scss";
import haversineKm from "../utils/haversineKm";
import { scoreCalculate } from "../utils/scoreCalculate";
import type { Clip } from "../types/Clip";

interface MapProps {
  roundData: Clip;
  gameRound: number;
  setGameRound: (n: number) => void;
}

function Map({ roundData, gameRound, setGameRound }: MapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const correctMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [hasPin, setHasPin] = useState(false);
  const correctLocation = { lng: roundData.lng, lat: roundData.lat };
  const [confirmedAnswer, setConfirmedAnswer] = useState<{
    lng: number;
    lat: number;
  } | null>(null);
  const [answerDistance, setAnswerDistance] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);

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

    map.doubleClickZoom.disable();

    const handleDblClick = (e: mapboxgl.MapMouseEvent) => {
      if (confirmedAnswer) return;
      const lngLat = e.lngLat;
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }

      const marker = new mapboxgl.Marker({ color: "#e74c3c" })
        .setLngLat(lngLat)
        .addTo(map);

      markerRef.current = marker;
      setHasPin(true);
    };

    map.on("dblclick", handleDblClick);

    return () => {
      map.off("dblclick", handleDblClick);
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      setHasPin(false);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleConfirm = () => {
    if (!markerRef.current) {
      console.log("No marker to confirm");
      return;
    }

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
    if (map) {
      if (correctMarkerRef.current) {
        correctMarkerRef.current.remove();
        correctMarkerRef.current = null;
      }
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
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [
                [answered.lng, answered.lat],
                [correctLocation.lng, correctLocation.lat],
              ],
            },
          },
        ],
      };

      if (map.getSource(lineId)) {
        const src = map.getSource(lineId) as mapboxgl.GeoJSONSource;
        src.setData(lineGeo as GeoJSON.FeatureCollection);
      } else {
        map.addSource(lineId, { type: "geojson", data: lineGeo });
        map.addLayer({
          id: lineId,
          type: "line",
          source: lineId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "black",
            "line-width": 3,
            "line-opacity": 0.8,
            "line-dasharray": [2, 2],
          },
        });
      }
    }
    console.log("Confirmed answer:", answered);
    console.log(`Distance to correct location: ${distanceKm.toFixed(3)} km`);
  };

  const handleNext = () => {
    // cleanup marker and reset for next round
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    // remove correct marker and line
    if (correctMarkerRef.current) {
      correctMarkerRef.current.remove();
      correctMarkerRef.current = null;
    }
    const map = mapRef.current;
    const lineId = "answer-line";
    if (map) {
      if (map.getLayer && map.getLayer(lineId)) {
        try {
          map.removeLayer(lineId);
        } catch {
          /* ignore */
        }
      }
      if (map.getSource && map.getSource(lineId)) {
        try {
          map.removeSource(lineId);
        } catch {
          /* ignore */
        }
      }
    }
    setHasPin(false);
    setConfirmedAnswer(null);
    setAnswerDistance(null);
    setScore(null);
    setGameRound(gameRound + 1);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div
        id="map-container"
        ref={mapContainerRef}
        style={{ width: "100%", height: "100%" }}
      />

      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          background: "rgba(255,255,255,0.92)",
          padding: 12,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          zIndex: 20,
          maxWidth: 400,
        }}
      >
        <div style={{ fontWeight: 600 }}>
          <h2>Instructions</h2>
        </div>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 16 }}>
          <li>
            Try to guess where this person is from based on their English accent
          </li>
          <li>Double Click to place your guess</li>
          <li>Confirm your guess</li>
        </ol>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        {!confirmedAnswer ? (
          <>
            <AudioPlayer src={roundData.audioUrl} />
            <button
              onClick={handleConfirm}
              disabled={!hasPin}
              style={{
                padding: "10px 18px",
                borderRadius: 8,
                border: "none",
                background: hasPin ? "#2b8a3e" : "#888",
                color: "white",
                cursor: hasPin ? "pointer" : "not-allowed",
                boxShadow: hasPin ? "0 2px 6px rgba(43,138,62,0.3)" : undefined,
                fontSize: 20,
                marginTop: 12,
              }}
            >
              Confirm Guess
            </button>
          </>
        ) : (
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
            <div style={{ fontSize: 16, fontWeight: 600 }}>Results</div>
            <div style={{ fontSize: 14 }}>
              Distance:{" "}
              {answerDistance ? `${answerDistance.toFixed(3)} km` : "-"}
            </div>
            <div style={{ fontSize: 14 }}>Score: {score ?? "-"}</div>
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
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Map;
