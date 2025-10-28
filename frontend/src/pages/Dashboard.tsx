import { useEffect, useState } from "react";
import "../scss/Dashboard.scss";
import axios from "axios";
import useAuth from "../hooks/useAuth";

type Round = {
  id: number;
  score: number;
  guessLat: number;
  guessLong: number;
  gameId: number;
  speakerId: number;
};

type Game = {
  id: number;
  totalScore: number;
  rounds: Round[];
  createdAt: string;
};

function Dashboard() {
  const { token, username, userPictureURL, isLoggedIn } = useAuth();
  const [games, setGames] = useState<Game[] | null>(null);
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
          ? (res.data as Game[]).map((g) => ({ ...g, createdAt: g.createdAt ? String(g.createdAt) : "" }))
          : [];
        setGames(data);
      } catch (err: unknown) {
        console.error("Failed to fetch games", err);
        setError("Failed to load games. Make sure you're logged in and the backend is running.");
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) fetchGames();
    else setGames([]);
  }, [token, isLoggedIn]);

  const roundRows: Array<Round & { gameCreatedAt?: string }> = [];
  if (games) {
    games.forEach((g) => {
      (g.rounds || []).forEach((r) => {
        roundRows.push({ ...r, gameCreatedAt: g.createdAt });
      });
    });
  }

  return (
    <div className="dashboard-page">
      <div className="profile-bar">
        <div className="profile-info">
          <img
            className="profile-pic"
            src={userPictureURL ?? "/testAudios/avatar-placeholder.png"}
            alt={username ?? "User avatar"}
          />
          <div className="profile-text">
            <div className="profile-name">{username ?? (isLoggedIn ? "Unknown user" : "Not signed in")}</div>
            <div className="profile-sub">{isLoggedIn ? "Signed in" : "Sign in to see your games"}</div>
          </div>
        </div>
      </div>

      <div className="games-section">
        <h2>Your rounds</h2>

        {loading && <div className="muted">Loading...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && (
          <div className="table-wrapper">
            <table className="games-table">
              <thead>
                <tr>
                  <th>Game ID</th>
                  <th>Round ID</th>
                  <th>Score</th>
                  <th>Speaker ID</th>
                  <th>Guess (lat,long)</th>
                  <th>Game created</th>
                </tr>
              </thead>
              <tbody>
                {roundRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="muted">
                      No rounds to show
                    </td>
                  </tr>
                )}
                {roundRows.map((r) => (
                  <tr key={r.id + "-" + r.gameId}>
                    <td>{r.gameId}</td>
                    <td>{r.id}</td>
                    <td>{r.score}</td>
                    <td>{r.speakerId}</td>
                    <td>
                      {Number(r.guessLat).toFixed(4)}, {Number(r.guessLong).toFixed(4)}
                    </td>
                    <td>{r.gameCreatedAt ? new Date(r.gameCreatedAt).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;