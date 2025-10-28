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
          <div style={{ marginBottom: 12 }}>
            <DashboardChart games={games ?? []} height={220} />
          </div>

          {loading && <div className="loading-text">Loading...</div>}
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
                                      <th>Speaker</th>
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
                                          {r.speaker
                                            ? r.speaker.country ??
                                              `#${r.speaker.id}`
                                            : `#${r.speakerId}`}
                                        </td>
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
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
