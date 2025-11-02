import { useMemo } from "react";
import type { Match, MatchPlayer } from "../types/Match";
import "../scss/LiveLeaderboard.scss";

interface LiveLeaderboardProps {
  roomState: Match;
}

const COLOR_PALETTE = [
  "#e74c3c",
  "#8e44ad",
  "#3498db",
  "#1abc9c",
  "#f39c12",
  "#2ecc71",
  "#e67e22",
  "#34495e",
];

function pickColorForPlayer(p: MatchPlayer) {
  // deterministic color by orderIndex or id
  const idx = typeof p.orderIndex === "number" ? p.orderIndex : p.id;
  return COLOR_PALETTE[idx % COLOR_PALETTE.length];
}

export default function LiveLeaderboard({ roomState }: LiveLeaderboardProps) {
  const currentRound = roomState.currentRound ?? 0;

  const rows = useMemo(() => {
    console.log("Recomputing leaderboard rows", roomState.matchRounds);
    const totals = new Map<number, number>();
    for (const r of roomState.matchRounds || []) {
      for (const g of r.guesses || []) {
        if (typeof g.score === "number") {
          totals.set(g.playerId, (totals.get(g.playerId) || 0) + g.score);
        }
      }
    }

    const currentRoundGuesses =
      roomState.matchRounds?.[currentRound]?.guesses || [];

    return roomState.matchPlayers
      .map((p) => {
        console.log(currentRoundGuesses);
        const curGuess = currentRoundGuesses.find((g) => g.playerId === p.id);
        const currentRoundScore =
          typeof curGuess?.score === "number" ? curGuess.score : 0;
        const totalScore = totals.get(p.id) || 0;
        const status = (() => {
          if (roomState.status === "ended") return "Finished";
          if (curGuess) return curGuess.score == null ? "Ready" : "Scored";
          return "Guessing";
        })();

        return {
          id: p.id,
          name: p.name || (p.userId ? `User ${p.userId}` : "Guest"),
          color: pickColorForPlayer(p),
          currentRoundScore,
          totalScore,
          status,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [roomState]);

  return (
    <aside className="live-leaderboard" aria-label="Live leaderboard">
      <div className="leaderboard-header">
        <h2 className="header-title">LEADERBOARD</h2>
      </div>
      <div className="columns-row" aria-hidden="true">
        <div className="columns-left">
          <span className="col-label">Player</span>
        </div>
        <div className="columns-right">
          <span className="col-label">Round</span>
          <span className="col-label">Total</span>
          <span className="col-label">Status</span>
        </div>
      </div>
      <ul className="leaderboard-list">
        {rows.map((r, index) => (
          <li key={r.id} className="leaderboard-row">
            <div className="player-left">
              <span className="player-rank">#{index + 1}</span>
              <span
                className="player-color"
                style={{ backgroundColor: r.color }}
                aria-hidden="true"
              />
              <span className="player-name">{r.name}</span>
            </div>
            <div className="player-right">
              <span className="round-score">{r.currentRoundScore}</span>
              <span className="total-score">{r.totalScore}</span>
              <span className={`status status-${r.status.toLowerCase()}`}>
                {r.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
