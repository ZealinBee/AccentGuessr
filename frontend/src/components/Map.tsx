import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import AudioPlayer from "./AudioPlayer";

import "mapbox-gl/dist/mapbox-gl.css";

import "../scss/Map.scss";

function Map() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;
    if (token) mapboxgl.accessToken = token;

    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-74.0242, 40.6941],
      zoom: 10.12,
    });

    mapRef.current = map;

    map.doubleClickZoom.disable();

    const handleDblClick = (e: mapboxgl.MapMouseEvent) => {
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
    // placeholder: will be implemented later
    console.log("Confirm Guess clicked");
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div id="map-container" ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

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
        <div style={{ fontWeight: 600}}>
          <h2>Instructions</h2>
        </div>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 16 }}>
          <li>Try to guess where this person is from based on their English accent</li>
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
        <AudioPlayer />
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
            marginTop: 12
          }}
        >
          Confirm Guess
        </button>
      </div>
    </div>
  );
}

export default Map;
