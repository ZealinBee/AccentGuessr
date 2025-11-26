import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  getVolunteerVoices,
  getAccents,
  rejectVolunteerVoice,
  acceptVolunteerVoice,
} from "../api/volunteerVoices";
import type { VolunteerVoice, Accent } from "../api/volunteerVoices";
import AuthContext from "../context/AuthContext";
import "../scss/VolunteerDashboard.scss";

type FilterStatus = "all" | "accepted" | "pending" | "rejected";

function VolunteerDashboard() {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { token } = authContext;
  const [voices, setVoices] = useState<VolunteerVoice[]>([]);
  const [filteredVoices, setFilteredVoices] = useState<VolunteerVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [accents, setAccents] = useState<Accent[]>([]);
  const [showAccentModal, setShowAccentModal] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<number | null>(null);
  const [selectedAccentId, setSelectedAccentId] = useState<number | null>(null);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setLoading(true);
        const data = await getVolunteerVoices(token);
        setVoices(data);
        setError(null);
      } catch (err: unknown) {
        console.error("Error fetching volunteer voices:", err);
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosErr = err as { response?: { status?: number } };
          if (axiosErr.response?.status === 401) {
            setError("Access denied. You must be logged in as an admin to view this page.");
          } else {
            setError("Failed to load volunteer voices");
          }
        } else {
          setError("Failed to load volunteer voices");
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchAccents = async () => {
      try {
        const data = await getAccents(token);
        setAccents(data);
      } catch (err: unknown) {
        console.error("Error fetching accents:", err);
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosErr = err as { response?: { status?: number } };
          if (axiosErr.response?.status !== 401) {
            // Only show accent error if it's not an auth issue (already shown above)
            setError("Failed to load accents");
          }
        }
      }
    };

    fetchVoices();
    fetchAccents();
  }, [token]);

  useEffect(() => {
    if (filter === "all") {
      setFilteredVoices(voices);
    } else {
      setFilteredVoices(voices.filter((voice) => voice.status === filter));
    }
  }, [filter, voices]);

  const handleAccept = (id: number) => {
    setSelectedVoiceId(id);
    setSelectedAccentId(null);
    setShowAccentModal(true);
  };

  const handleConfirmAccept = async () => {
    if (!selectedVoiceId || !selectedAccentId) {
      alert("Please select an accent");
      return;
    }

    setAcceptingId(selectedVoiceId);
    try {
      await acceptVolunteerVoice(selectedVoiceId, selectedAccentId, token);

      // Update the voices state to reflect the change
      setVoices((prevVoices) =>
        prevVoices.map((voice) =>
          voice.id === selectedVoiceId
            ? { ...voice, status: "accepted" as const }
            : voice
        )
      );

      setShowAccentModal(false);
      setSelectedVoiceId(null);
      setSelectedAccentId(null);
    } catch (err: unknown) {
      console.error("Error accepting voice:", err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 401) {
          alert("Access denied. You must be logged in as an admin to perform this action.");
        } else {
          alert("Failed to accept voice. Please try again.");
        }
      } else {
        alert("Failed to accept voice. Please try again.");
      }
    } finally {
      setAcceptingId(null);
    }
  };

  const handleCancelAccept = () => {
    setShowAccentModal(false);
    setSelectedVoiceId(null);
    setSelectedAccentId(null);
  };

  const handleReject = async (id: number) => {
    if (!confirm("Are you sure you want to reject this voice?")) {
      return;
    }

    setRejectingId(id);
    try {
      await rejectVolunteerVoice(id, token);

      // Update the voices state to reflect the change
      setVoices((prevVoices) =>
        prevVoices.map((voice) =>
          voice.id === id ? { ...voice, status: "rejected" as const } : voice
        )
      );
    } catch (err: unknown) {
      console.error("Error rejecting voice:", err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 401) {
          alert("Access denied. You must be logged in as an admin to perform this action.");
        } else {
          alert("Failed to reject voice. Please try again.");
        }
      } else {
        alert("Failed to reject voice. Please try again.");
      }
    } finally {
      setRejectingId(null);
    }
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

              <div className="voice-details">
                <div className="detail-item">
                  <strong>Native Language:</strong> {voice.nativeLanguage}
                </div>
                {voice.country && (
                  <div className="detail-item">
                    <strong>Country:</strong> {voice.country}
                  </div>
                )}
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
                  disabled={voice.status === "accepted" || acceptingId === voice.id}
                >
                  {acceptingId === voice.id ? "Accepting..." : "✓ Accept"}
                </button>
                <button
                  className="action-btn reject-btn"
                  onClick={() => handleReject(voice.id)}
                  disabled={voice.status === "rejected" || rejectingId === voice.id}
                >
                  {rejectingId === voice.id ? "Rejecting..." : "✗ Reject"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAccentModal && (
        <div className="modal-overlay" onClick={handleCancelAccept}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Select an Accent</h2>
            <p className="modal-subtitle">
              Choose the accent that best matches this voice recording
            </p>

            <div className="accent-list">
              {accents.length === 0 ? (
                <div className="no-accents-message">
                  <p>No accents available. Please check your database.</p>
                </div>
              ) : (
                accents.map((accent) => (
                  <div
                    key={accent.id}
                    className={`accent-item ${selectedAccentId === accent.id ? "selected" : ""}`}
                    onClick={() => setSelectedAccentId(accent.id)}
                  >
                    <div className="accent-name">{accent.name}</div>
                    {accent.description && (
                      <div className="accent-description">{accent.description}</div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="modal-actions">
              <button
                className="modal-btn cancel-btn"
                onClick={handleCancelAccept}
              >
                Cancel
              </button>
              <button
                className="modal-btn confirm-btn"
                onClick={handleConfirmAccept}
                disabled={!selectedAccentId || acceptingId !== null}
              >
                {acceptingId ? "Accepting..." : "Confirm Accept"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VolunteerDashboard;
