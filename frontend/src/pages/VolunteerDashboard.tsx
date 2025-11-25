import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVolunteerVoices } from "../api/volunteerVoices";
import type { VolunteerVoice } from "../api/volunteerVoices";
import "../scss/VolunteerDashboard.scss";

type FilterStatus = "all" | "accepted" | "pending" | "rejected";

function VolunteerDashboard() {
  const navigate = useNavigate();
  const [voices, setVoices] = useState<VolunteerVoice[]>([]);
  const [filteredVoices, setFilteredVoices] = useState<VolunteerVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const [playingId, setPlayingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setLoading(true);
        const data = await getVolunteerVoices();
        setVoices(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching volunteer voices:", err);
        setError("Failed to load volunteer voices");
      } finally {
        setLoading(false);
      }
    };

    fetchVoices();
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setFilteredVoices(voices);
    } else {
      setFilteredVoices(voices.filter((voice) => voice.status === filter));
    }
  }, [filter, voices]);

  const handleAccept = (id: number) => {
    // Placeholder for accept functionality
    console.log("Accept voice:", id);
    alert(`Accept functionality for voice ${id} will be implemented`);
  };

  const handleReject = (id: number) => {
    // Placeholder for reject functionality
    console.log("Reject voice:", id);
    alert(`Reject functionality for voice ${id} will be implemented`);
  };

  const handlePlay = (id: number) => {
    setPlayingId(id);
  };

  const handleEnded = () => {
    setPlayingId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "accepted":
        return "status-badge status-accepted";
      case "rejected":
        return "status-badge status-rejected";
      case "pending":
        return "status-badge status-pending";
      default:
        return "status-badge";
    }
  };

  if (loading) {
    return (
      <div className="volunteer-dashboard-container">
        <div className="loader-container">
          <div className="loader"></div>
          <p>Loading volunteer voices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="volunteer-dashboard-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/")}>Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="volunteer-dashboard-container">
      <button
        className="dashboard-back-home-button"
        onClick={() => navigate("/")}
      >
        ← Home
      </button>

      <div className="dashboard-header">
        <h1>Volunteer Voices Dashboard</h1>
        <p className="dashboard-subtitle">
          Review and manage volunteer accent submissions
        </p>
      </div>

      <div className="filter-section">
        <div className="filter-buttons">
          <button
            className={filter === "all" ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter("all")}
          >
            All ({voices.length})
          </button>
          <button
            className={
              filter === "pending" ? "filter-btn active" : "filter-btn"
            }
            onClick={() => setFilter("pending")}
          >
            Pending ({voices.filter((v) => v.status === "pending").length})
          </button>
          <button
            className={
              filter === "accepted" ? "filter-btn active" : "filter-btn"
            }
            onClick={() => setFilter("accepted")}
          >
            Accepted ({voices.filter((v) => v.status === "accepted").length})
          </button>
          <button
            className={
              filter === "rejected" ? "filter-btn active" : "filter-btn"
            }
            onClick={() => setFilter("rejected")}
          >
            Rejected ({voices.filter((v) => v.status === "rejected").length})
          </button>
        </div>
      </div>

      <div className="voices-list">
        {filteredVoices.length === 0 ? (
          <div className="no-voices-message">
            <p>No {filter !== "all" ? filter : ""} voices found</p>
          </div>
        ) : (
          filteredVoices.map((voice) => (
            <div key={voice.id} className="voice-card">
              <div className="voice-card-header">
                <div className="voice-info">
                  <span className="voice-id">ID: {voice.id}</span>
                  <span className={getStatusBadgeClass(voice.status)}>
                    {voice.status.charAt(0).toUpperCase() +
                      voice.status.slice(1)}
                  </span>
                </div>
                <span className="voice-date">{formatDate(voice.createdAt)}</span>
              </div>

              {voice.userEmail && (
                <div className="voice-email">
                  <strong>Email:</strong> {voice.userEmail}
                </div>
              )}

              <div className="audio-player">
                <audio
                  controls
                  src={voice.url}
                  onPlay={() => handlePlay(voice.id)}
                  onEnded={handleEnded}
                  preload="metadata"
                >
                  Your browser does not support the audio element.
                </audio>
                {playingId === voice.id && (
                  <span className="playing-indicator">▶ Playing</span>
                )}
              </div>

              <div className="voice-actions">
                <button
                  className="action-btn accept-btn"
                  onClick={() => handleAccept(voice.id)}
                  disabled={voice.status === "accepted"}
                >
                  ✓ Accept
                </button>
                <button
                  className="action-btn reject-btn"
                  onClick={() => handleReject(voice.id)}
                  disabled={voice.status === "rejected"}
                >
                  ✗ Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default VolunteerDashboard;
