import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../scss/Dashboard.scss";
import DashboardChart from "../components/DashboardChart";
import axios from "axios";
import useAuth from "../hooks/useAuth";

type Round = {
  id: number;
  score: number;
  guessLat: number;
  guessLong: number;
  gameId: number;
  speakerId: number;
  speaker?: {
    id: number;
    country?: string | null;
    accent?: {
      id: number;
      name: string;
      region: unknown;
      description?: string | null;
      type?: string | null;
      createdAt: string;
    } | null;
  } | null;
};

type Game = {
  id: number;
  totalScore: number;
  rounds: Round[];
  createdAt: string;
};

function Dashboard() {
  const navigate = useNavigate();
  const { token, isLoggedIn } = useAuth();
  const [games, setGames] = useState<Game[] | null>(null);
  const [expandedGames, setExpandedGames] = useState<Record<number, boolean>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      setError(null);
      try {
        const base = import.meta.env.VITE_API_URL;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${base}/games/my-games`, { headers });
        const data = Array.isArray(res.data)
          ? (res.data as Game[]).map((g) => ({
              ...g,
              createdAt: g.createdAt ? String(g.createdAt) : "",
            }))
              .sort((a, b) => {
                // Sort by createdAt ascending (oldest first)
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateA - dateB;
              })
          : [];
        setGames(data);
      } catch (err: unknown) {
        console.error("Failed to fetch games", err);
        setError("Play a game to see your past games here!");
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) fetchGames();
    else setGames([]);
  }, [token, isLoggedIn]);

  const toggleExpand = (gameId: number) => {
    setExpandedGames((prev) => ({ ...prev, [gameId]: !prev[gameId] }));
  };

  const handleDeleteAllGames = async () => {
    setIsDeleting(true);
    try {
      const base = import.meta.env.VITE_API_URL;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${base}/games/my-games`, { headers });
      setGames([]);
      setShowDeleteModal(false);
      setError(null);
    } catch (err: unknown) {
      console.error("Failed to delete games", err);
      setError("Failed to delete games. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        <div className="dashboard-topbar">
          <button
            className="back-button"
            onClick={() => navigate("/")}
            aria-label="Go back to home"
          >
            ← Home
          </button>
        </div>
        <div className="games-section">
          {/* Chart showing totalScore across all games */}
          {!loading && (
            <div style={{ marginBottom: 12 }}>
              <DashboardChart games={games ?? []} height={220} />
            </div>
          )}

          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <div className="loading-text">Loading your games...</div>
            </div>
          )}
          {error && <div className="error">{error}</div>}

          {!loading && !error && (
            <div className="table-wrapper">
              <table className="games-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }} />
                    <th>Game</th>
                    <th>Total score</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {!games || games.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="muted">
                        No games to show
                      </td>
                    </tr>
                  ) : (
                    games.map((g, idx) => (
                      <React.Fragment key={g.id}>
                        <tr
                          key={g.id}
                          onClick={() => toggleExpand(g.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>
                            <button
                              aria-label={
                                expandedGames[g.id] ? "collapse" : "expand"
                              }
                            >
                              {expandedGames[g.id] ? "▾" : "▸"}
                            </button>
                          </td>
                          <td>{idx + 1}</td>
                          <td>{g.totalScore}</td>
                          <td>
                            {g.createdAt
                              ? new Date(g.createdAt).toLocaleString()
                              : "-"}
                          </td>
                        </tr>

                        {expandedGames[g.id] && (
                          <tr>
                            <td colSpan={4} style={{ padding: 0 }}>
                              <div className="nested-table-wrapper">
                                <table className="nested-table">
                                  <thead>
                                    <tr>
                                      <th>Round</th>
                                      <th>Score</th>
                                      <th>Accent</th>
                                      <th>Guess (lat, long)</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {g.rounds.map((r, rIdx) => (
                                      <tr key={r.id}>
                                        <td>{rIdx + 1}</td>
                                        <td>{r.score}</td>
                                        <td>
                                          {r.speaker && r.speaker.accent
                                            ? r.speaker.accent.name
                                            : "-"}
                                        </td>
                                        <td>
                                          {Number(r.guessLat).toFixed(4)},{" "}
                                          {Number(r.guessLong).toFixed(4)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!loading && games && games.length > 0 && (
            <div className="delete-section">
              <button
                className="delete-all-button"
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
              >
                🗑️ Delete All My Games
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dangerous Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content danger" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="danger-icon">⚠️</div>
              <h2>Delete All Games</h2>
            </div>
            <div className="modal-body">
              <p className="danger-warning">
                <strong>WARNING: This action cannot be undone!</strong>
              </p>
              <p>
                You are about to permanently delete <strong>all {games?.length || 0} of your games</strong> and their associated data. This is so that you can play all the games again.
              </p>
              <ul className="danger-list">
                <li>All game scores will be lost</li>
                <li>All round history will be deleted</li>
                <li>This data cannot be recovered</li>
              </ul>
              <p className="confirmation-text">
                Are you absolutely sure you want to continue?
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="modal-button cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="modal-button delete-confirm"
                onClick={handleDeleteAllGames}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
