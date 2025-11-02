import { useMemo } from "react";
import type { Match } from "../types/Match";
import "../scss/LiveLeaderboard.scss";

interface LiveLeaderboardProps {
  roomState: Match;
  playerId: number | null;
}

export default function LiveLeaderboard({ roomState, playerId }: LiveLeaderboardProps) {
  const currentRound = roomState.currentRound ?? 0;

  const rows = useMemo(() => {
    const totals = new Map<number, number>();

    // calculate cumulative scores
    for (const round of roomState.matchRounds || []) {
      for (const guess of round.guesses || []) {
        if (typeof guess.score === "number") {
          totals.set(
            guess.playerId,
            (totals.get(guess.playerId) || 0) + guess.score
          );
        }
      }
    }

    const currentRoundGuesses =
      roomState.matchRounds?.[currentRound]?.guesses || [];

    return roomState.matchPlayers
      .map((p) => {
        const curGuess = currentRoundGuesses.find((g) => g.playerId === p.id);
        const currentRoundScore =
          typeof curGuess?.score === "number" ? curGuess.score : 0;
        const totalScore = totals.get(p.id) || 0;
        const status = (() => {
          if (roomState.status === "ended") return "Finished";
          if (curGuess) return curGuess.score == null ? "Ready" : "Scored";
          return "Guessing";
        })();

        const isCurrent = p.id === playerId;

        return {
          id: p.id,
          name: p.name || (p.userId ? `User ${p.userId}` : "Guest"),
          currentRoundScore,
          totalScore,
          status,
          isCurrent,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [roomState, playerId, currentRound]);

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
          <li
            key={r.id}
            className={`leaderboard-row ${r.isCurrent ? "you" : ""}`}
          >
            <div className="player-left">
              <span className="player-rank">#{index + 1}</span>
              <span className="player-name">
                {r.name}
                {r.isCurrent && <span className="you-tag"> (You)</span>}
              </span>
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
