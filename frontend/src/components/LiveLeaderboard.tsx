import { useMemo } from "react";
import type { Match } from "../types/Match";
import { getPlayerColor } from "../utils/playerColors";
import "../scss/LiveLeaderboard.scss";

interface LiveLeaderboardProps {
  roomState: Match;
  playerId: number | null;
}

export default function LiveLeaderboard({
  roomState,
  playerId,
}: LiveLeaderboardProps) {
  const currentRound = roomState.currentRound ?? 0;

  const rows = useMemo(() => {
    const totals = new Map<number, number>();
    const isRoundResolved = roomState.matchRounds?.[currentRound]?.isResolved;

    // calculate cumulative scores from PREVIOUS rounds only (exclude current round)
    for (let i = 0; i < currentRound; i++) {
      const round = roomState.matchRounds?.[i];
      if (!round) continue;

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
        const isCurrent = p.id === playerId;

        // For other players when round is not resolved, hide their scores
        const shouldShowScore = isRoundResolved || isCurrent;

        const currentRoundScore =
          shouldShowScore && typeof curGuess?.score === "number"
            ? curGuess.score
            : 0;

        // Show previous rounds total, or "—" if this is the first round
        // For current player, always include current round score in total
        const hasPreviousRounds = currentRound > 0;
        let totalScore: number | null;

        if (
          typeof curGuess?.score === "number" &&
          (isCurrent || isRoundResolved)
        ) {
          totalScore = (totals.get(p.id) || 0) + curGuess.score;
        } else if (hasPreviousRounds) {
          totalScore = totals.get(p.id) || 0;
        } else {
          totalScore = null;
        }

        const status = (() => {
          if (roomState.status === "ended") return "Finished";
          if (curGuess) return curGuess.score == null ? "Ready" : "Ready";
          return "Guessing";
        })();

        return {
          id: p.id,
          name: p.name || (p.userId ? `User ${p.userId}` : "Guest"),
          currentRoundScore,
          totalScore,
          status,
          isCurrent,
          shouldShowScore,
          color: getPlayerColor(p.id, playerId),
        };
      })
      .sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0));
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
          <span className="col-label">Score</span>
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
              <span
                className="player-color"
                style={{ backgroundColor: r.color }}
              />
              <span className="player-name">
                {r.name}
                {r.isCurrent && <span className="you-tag"> (You)</span>}
              </span>
            </div>
            <div className="player-right">
              <span className="round-score">
                {r.shouldShowScore ? r.currentRoundScore : "—"}
              </span>
              <span className="total-score">
                {r.totalScore !== null ? r.totalScore : "—"}
              </span>
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
