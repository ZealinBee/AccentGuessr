import { useEffect, useState } from "react";
import { useMatch } from "../hooks/useMatch";
import useAuth from "../hooks/useAuth";
import { useMatchSocket } from "../hooks/useMatchWebSocket";
import { useParams } from "react-router-dom";
import type { Match } from "../types/Match";
import "../scss/MultiplayerLobby.scss";

function MultiplayerLobby() {
  const { matchCode } = useParams<{ matchCode: string }>();
  const numericCode = Number(matchCode);
  const { userId, username } = useAuth();
  const { connected, joinMatch } = useMatchSocket(numericCode, {
    onMatchJoined: (data) => {
      console.log("HELLO MATCH JOINED", data.match);
      setRoomState(data.match);
      setIsOwner(data.isOwner);
    },
    onPlayerJoined: (data) => {
      console.log("HELLO SOMEONE JOINED", data);
      setRoomState(data);
    },
    onPlayerLeft: (data) => {
      setRoomState(data);
    },
  });
  const [roomState, setRoomState] = useState<Match | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!connected || !numericCode) return;

    const isGuest = !userId;
    joinMatch(username || `Guest_${Math.floor(Math.random() * 1000)}`, isGuest);
  }, [numericCode, connected]);

  return (
    <div className="lobby-container">
      <div className="lobby-background-image" />
      <div className="lobby-background-overlay" />

      <div className="lobby-content">
        <div className="lobby-card">
          <h1 className="lobby-title">Multiplayer Lobby</h1>

          <div className="lobby-info">
            <div className="lobby-info-item">
              <span className="lobby-info-label">Match Code</span>
              <span className="lobby-info-value">
                {roomState?.code || matchCode}
              </span>
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

            {roomState?.owner && (
              <div className="lobby-info-item">
                <span className="lobby-info-label">Host</span>
                <span className="lobby-info-value">{roomState.owner.name}</span>
              </div>
            )}

            <div className="lobby-info-item">
              <span className="lobby-info-label">Rounds</span>
              <span className="lobby-info-value">
                {roomState?.currentRound} / {roomState?.maxRounds}
              </span>
            </div>
          </div>

          <div className="lobby-players-section">
            <h3 className="lobby-players-heading">
              Players ({roomState?.matchPlayers?.length || 0})
            </h3>

            {roomState?.matchPlayers && roomState.matchPlayers.length > 0 ? (
              <ul className="lobby-players-list">
                {roomState.matchPlayers.map((player: any) => (
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
            <button className="lobby-start-button">Start Game</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MultiplayerLobby;
