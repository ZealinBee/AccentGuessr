import { useMemo, useState } from "react";
import type { Match } from "../types/Match";
import "../scss/MultiplayerEndGameLeaderboard.scss";
import { Share2 } from "lucide-react";

interface MultiplayerEndGameLeaderboardProps {
  roomState: Match;
  playerId: number | null;
  onReturnToLobby?: () => void;
}

export default function MultiplayerEndGameLeaderboard({
  roomState,
  playerId,
  onReturnToLobby,
}: MultiplayerEndGameLeaderboardProps) {
  const [shareSuccess, setShareSuccess] = useState(false);

  const finalResults = useMemo(() => {
    const totals = new Map<number, number>();

    // Calculate total scores from all rounds
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

    return roomState.matchPlayers
      .map((p) => {
        const isCurrent = p.id === playerId;
        const totalScore = totals.get(p.id) || 0;

        return {
          id: p.id,
          name: p.name || (p.userId ? `User ${p.userId}` : "Guest"),
          totalScore,
          isCurrent,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [roomState, playerId]);

  const winner = finalResults[0];
  const currentPlayerResult = finalResults.find((r) => r.isCurrent);
  const currentPlayerRank = currentPlayerResult
    ? finalResults.indexOf(currentPlayerResult) + 1
    : null;

  const handleShare = async () => {
    const homeLink = window.location.origin;
    const playerScore = currentPlayerResult?.totalScore || 0;
    const rankText = currentPlayerRank ? `#${currentPlayerRank} of ${finalResults.length}` : '';

    const shareText = `🏆 Just finished an AccentGuessr match!\n\n📊 My Results:\n${rankText ? `Rank: ${rankText}\n` : ''}Score: ${playerScore} points\n\n🌍 Think you can do better?\nPlay now: ${homeLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '🏆 AccentGuessr Results',
          text: shareText,
          url: homeLink,
        });
      } catch (err) {
        console.error('Failed to share:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className="endgame-container">
      <div className="endgame-background-image" />
      <div className="endgame-background-overlay" />

      <div className="endgame-content">
        <div className="endgame-card">
          <div className="endgame-header">
            <h1 className="endgame-title">Game Over</h1>
            {winner && (
              <div className="winner-announcement">
                <div className="winner-text">
                  <span className="winner-label">Winner:</span>
                  <span className="winner-name">{winner.name}</span>
                  <span className="winner-score">{winner.totalScore} points</span>
                </div>
              </div>
            )}

            {currentPlayerRank && (
              <div className="player-result">
                <span className="result-label">Your Placement:</span>
                <span className="result-rank">
                  #{currentPlayerRank} of {finalResults.length}
                </span>
                <span className="result-score">
                  {currentPlayerResult?.totalScore} points
                </span>
              </div>
            )}
          </div>

          <div className="endgame-leaderboard-section">
            <h2 className="endgame-leaderboard-heading">Final Rankings</h2>

            <div className="endgame-columns-row">
              <div className="endgame-columns-left">
                <span className="endgame-col-label">Rank</span>
                <span className="endgame-col-label">Player</span>
              </div>
              <div className="endgame-columns-right">
                <span className="endgame-col-label">Total Score</span>
              </div>
            </div>

            <ul className="endgame-leaderboard-list">
              {finalResults.map((player, index) => (
                <li
                  key={player.id}
                  className={`endgame-leaderboard-row ${
                    player.isCurrent ? "you" : ""
                  }`}
                >
                  <div className="endgame-player-left">
                    <span className="endgame-player-rank">
                      #{index + 1}
                    </span>
                    <span className="endgame-player-name">
                      {player.name}
                      {player.isCurrent && <span className="endgame-you-tag"> (You)</span>}
                    </span>
                  </div>
                  <div className="endgame-player-right">
                    <span className="endgame-total-score">{player.totalScore}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="endgame-actions">
            <button
              className="endgame-share-button"
              onClick={handleShare}
              title="Share results"
            >
              <Share2 size={18} />
              <span>Share Results</span>
              {shareSuccess && <span className="share-success-tooltip">Copied to clipboard!</span>}
            </button>

            {onReturnToLobby && (
              <button
                className="endgame-action-button"
                onClick={onReturnToLobby}
              >
                Return to Lobby
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}