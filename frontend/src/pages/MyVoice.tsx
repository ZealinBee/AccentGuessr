import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Mic } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "../scss/MyVoice.scss";
import "mapbox-gl/dist/mapbox-gl.css";
import useAuth from "../hooks/useAuth";
import LoginButton from "../components/GoogleLoginButton";
import axios from "axios";
import type { Accent } from "../types/Accent";
import type { Clip } from "../types/Clip";

interface Round {
  id: number;
  guessLat: number;
  guessLong: number;
  score: number;
  createdAt: string;
  gameId: number;
}

interface MySpeakerData {
  speaker: {
    id: number;
    country: string | null;
    createdAt: string;
    accent: Accent;
    clips: Clip[];
  };
  rounds: Round[];
}

function MyVoice() {
  const { token, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [speakerData, setSpeakerData] = useState<MySpeakerData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    const getMyVoice = async () => {
      if (!token) {
        setLoading(false);
        setError("Please log in to view your voice data");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get<MySpeakerData>(
          `${import.meta.env.VITE_API_URL}/speakers/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSpeakerData(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching my voice data:", error);
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setError(
            "No speaker profile found for your account, if you volunteered without signing up, please email me at zhiyuan.liu@tuni.fi, so I can add your voice manually. \n If you volunteered after signing up, please wait until the voice profile is created."
          );
        } else {
          setError("Failed to load your voice data");
        }
      } finally {
        setLoading(false);
      }
    };
    getMyVoice();
  }, [token]);

  useEffect(() => {
    if (!speakerData || !mapContainerRef.current) return;

    const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as
      | string
      | undefined;
    if (mapboxToken) mapboxgl.accessToken = mapboxToken;

    // Initialize map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [0, 20],
      zoom: 1.5,
    });

    mapRef.current = map;

    map.on("load", () => {
      // Clear any existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Add markers for each round
      speakerData.rounds.forEach((round) => {
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="padding: 8px;">
            <strong>Score:</strong> ${round.score}<br/>
          </div>`
        );

        const marker = new mapboxgl.Marker({ color: "#e74c3c" })
          .setLngLat([round.guessLong, round.guessLat])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });

      // Fit map to show all markers if there are any
      if (speakerData.rounds.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        speakerData.rounds.forEach((round) => {
          bounds.extend([round.guessLong, round.guessLat]);
        });
        map.fitBounds(bounds, { padding: 50, maxZoom: 8 });
      }
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      map.remove();
    };
  }, [speakerData]);

  if (loading) {
    return (
      <div className="my-voice-container">
        <p>Loading your voice data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-voice-container">
        <button
          className="my-voice-back-home-button"
          onClick={() => navigate("/")}
        >
          ← Home
        </button>
        <div className="error-card">
          <p className="error">{error}</p>

          {!isLoggedIn && (
            <>
              <p className="error-message">
                If you've already volunteered, sign in to link your voice:
              </p>
              <div className="my-voice-google-button">
                <LoginButton message="Continue with Google" navigateTo="my-voice" />
              </div>
            </>
          )}

          <p className="error-message">
            Or contribute your voice to the project:
          </p>
          <div className="button-wrapper">
            <button
              className="my-voice-volunteer-button"
              onClick={() => navigate("/volunteer")}
            >
              <Mic size={18} />
              <span>Volunteer Your Voice</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-voice-container">
      <button
        className="my-voice-back-home-button"
        onClick={() => navigate("/")}
      >
        ← Home
      </button>
      {speakerData && (
        <>
          <div className="speaker-info">
            <h2>Your Speaker Profile</h2>
            <p>
              <strong>Country:</strong> {speakerData.speaker.country || "N/A"}
            </p>
            <p>
              <strong>Accent:</strong>{" "}
              {speakerData.speaker.accent?.name || "N/A"}
            </p>
            <p>
              <strong>Total Guesses:</strong> {speakerData.rounds.length}
            </p>
            {speakerData.rounds.length > 0 && (
              <p>
                <strong>Average Score:</strong>{" "}
                {Math.round(
                  speakerData.rounds.reduce((sum, r) => sum + r.score, 0) /
                    speakerData.rounds.length
                )}
              </p>
            )}
          </div>
          <div className="map-section">
            <h2>Where People Thought You're From</h2>
            {speakerData.rounds.length > 0 ? (
              <div ref={mapContainerRef} className="map-container" />
            ) : (
              <p>No guesses recorded yet</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default MyVoice;
