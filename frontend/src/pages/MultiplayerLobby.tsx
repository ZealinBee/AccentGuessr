 import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { useMatchSocket } from "../hooks/useMatchWebSocket";
import { useParams, useNavigate } from "react-router-dom";
import type { Match } from "../types/Match";
import "../scss/MultiplayerLobby.scss";
import MultiplayerMap from "../components/MultiplayerMap";
import MultiplayerEndGameLeaderboard from "../components/MultiplayerEndGameLeaderboard";
import { Copy, Share2 } from "lucide-react";

function MultiplayerLobby() {
  const { matchCode } = useParams<{ matchCode: string }>();
  const navigate = useNavigate();
  const numericCode = Number(matchCode);
  const { userId, username } = useAuth();
  const { connected, joinMatch, startMatch } = useMatchSocket(numericCode, {
    onMatchJoined: (data) => {
      setRoomState(data.match);
      setIsOwner(data.isOwner);
      setPlayerId(data.playerId);
    },
    onPlayerJoined: (data) => {
      console.log("HELLO SOMEONE JOINED", data);
      setRoomState(data);
    },
    onPlayerLeft: (data) => {
      setRoomState(data);
    },
    onMatchStarted: (data) => {
      console.log("MATCH STARTED", data);
      setRoomState(data);
      setIsStartingGame(false);
    },
    onNewRound: (data) => {
      console.log("NEW ROUND STARTED", data);
      setRoomState(data);
    }
  });
  const [roomState, setRoomState] = useState<Match | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(String(roomState?.code || matchCode));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    const inviteLink = `${window.location.origin}/join/${roomState?.code || matchCode}`;
    const shareText = `Can you beat me in guessing where this accent is from? ${inviteLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AccentGuessr Challenge',
          text: shareText,
        });
      } catch (err) {
        console.error('Failed to share:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Share link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  useEffect(() => {
    if (!connected || !numericCode) return;

    const isGuest = !userId;
    joinMatch(username || `Guest_${Math.floor(Math.random() * 1000)}`, isGuest);
  }, [numericCode, connected]);

  if (!roomState) {
    return (
      <div className="lobby-container">
        <div className="lobby-background-image" />
        <div className="lobby-background-overlay" />

        <button
          className="lobby-back-home-button"
          onClick={() => navigate("/")}
        >
          ← Home
        </button>

        <div className="lobby-content">
          <div className="lobby-card">
            <div className="lobby-loading">
              <div className="lobby-loading-spinner" />
              <h2 className="lobby-loading-title">Connecting to lobby...</h2>
              <p className="lobby-loading-text">
                Please wait while we set up your room
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (roomState.status === "in_progress") {
    return (
      <MultiplayerMap
        roomState={roomState}
        playerId={playerId}
        onGuessConfirmed={(data) => {
          setRoomState(data);
          console.log("GUESS CONFIRMED", data);
        }}

      />
    );
  }

  if (roomState.status === "finished") {
    return (
      <MultiplayerEndGameLeaderboard
        roomState={roomState}
        playerId={playerId}
        onReturnToLobby={() => {
          // You can navigate to home or refresh the lobby
          window.location.href = "/";
        }}
      />
    );
  }

  return (
    <div className="lobby-container">
      <div className="lobby-background-image" />
      <div className="lobby-background-overlay" />

      <button
        className="lobby-back-home-button"
        onClick={() => navigate("/")}
      >
        ← Home
      </button>

      <div className="lobby-content">
        <div className="lobby-card">
          <h1 className="lobby-title">Multiplayer Lobby</h1>

          <div className="lobby-info">
            <div className="lobby-info-item">
              <span className="lobby-info-label">Match Code</span>
              <div className="lobby-code-container">
                <span className="lobby-info-value">
                  {roomState?.code || matchCode}
                </span>
                <button
                  className="lobby-icon-button"
                  onClick={handleCopyCode}
                  title="Copy match code"
                >
                  <Copy size={18} />
                  {copySuccess && <span className="lobby-copy-tooltip">Copied!</span>}
                </button>
                <button
                  className="lobby-icon-button"
                  onClick={handleShare}
                  title="Share match"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <div className="lobby-info-item">
              <span className="lobby-info-label">Status</span>
              <span
                className={`lobby-info-value ${
                  roomState?.status === "waiting"
                    ? "lobby-status-waiting"
                    : "lobby-status-active"
                }`}
              >
                {roomState?.status === "waiting"
                  ? "Waiting for players..."
                  : roomState?.status}
              </span>
            </div>
          </div>

          <div className="lobby-players-section">
            <h3 className="lobby-players-heading">
              Players ({roomState?.matchPlayers?.length || 0})
            </h3>

            {roomState?.matchPlayers && roomState.matchPlayers.length > 0 ? (
              <ul className="lobby-players-list">
                {roomState.matchPlayers.map((player) => (
                  <li
                    key={player.id}
                    className={`lobby-player-item ${
                      player.id === roomState.ownerId
                        ? "lobby-player-owner"
                        : ""
                    }`}
                  >
                    <span className="lobby-player-name">{player.name}</span>
                    {player.id === roomState.ownerId && (
                      <span className="lobby-player-badge">(Host)</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="lobby-no-players">No players yet.</p>
            )}
          </div>

          {isOwner && (
            <button
              className="lobby-start-button"
              onClick={() => {
                setIsStartingGame(true);
                startMatch();
              }}
              disabled={isStartingGame || (roomState?.matchPlayers?.length || 0) < 2}
            >
              {isStartingGame ? (
                <>
                  Starting Game
                  <span className="loading-spinner" />
                </>
              ) : (roomState?.matchPlayers?.length || 0) < 2 ? (
                "Need at least 1 more player"
              ) : (
                "Start Game"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MultiplayerLobby;
