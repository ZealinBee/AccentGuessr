import { useEffect, useRef, useState } from "react";
import { useMatch } from "../hooks/useMatch";
import useAuth from "../hooks/useAuth";
import { useMatchSocket } from "../hooks/useMatchWebSocket";
import { useParams } from "react-router-dom";
import type { Match } from "../types/Match";

function MultiplayerLobby() {
  const { matchCode } = useParams<{ matchCode: string }>();
  const numericCode = Number(matchCode);
  const { match } = useMatch();
  const { userId, username } = useAuth();
  const { connected, joinMatch } = useMatchSocket(numericCode, {
    onMatchJoined: (data) => {
      console.log("HELLO MATCH JOINED", data);
      setRoomState(data);
    },
    onPlayerJoined: (data) => {
      console.log("HELLO SOMEONE JOINED", data);
      setRoomState(data);
    },
    onPlayerLeft: (data) => {
      setRoomState(data);
    },
  });
  const [isOwner, setIsOwner] = useState(false);
  const [roomState, setRoomState] = useState<Match | null>(null);
  useEffect(() => {
    if (!connected || !numericCode) return;

    const isGuest = !userId;
    joinMatch(username || `Guest_${Math.floor(Math.random() * 1000)}`, isGuest);
  }, [numericCode, connected]);

  return (
    <div style={{ padding: "1.5rem", fontFamily: "sans-serif" }}>
      <h1>Multiplayer Lobby</h1>
      <p>
        <strong>Match Code:</strong> {roomState?.code || matchCode}
      </p>
      <p>
        <strong>Status:</strong>{" "}
        {roomState?.status === "waiting"
          ? "Waiting for players..."
          : roomState?.status}
      </p>

      {roomState?.owner && (
        <p>
          <strong>Owner:</strong> {roomState.owner.name}
        </p>
      )}

      <h3>Players ({roomState?.matchPlayers?.length || 0}):</h3>
      {roomState?.matchPlayers && roomState.matchPlayers.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {roomState.matchPlayers.map((player: any) => (
            <li
              key={player.id}
              style={{
                background:
                  player.id === roomState.ownerId ? "#e0f2fe" : "#f1f5f9",
                borderRadius: "8px",
                padding: "8px 12px",
                marginBottom: "6px",
              }}
            >
              {player.name}
              {player.id === roomState.ownerId && (
                <span style={{ marginLeft: "6px", color: "#2563eb" }}>
                  (Owner)
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No players yet.</p>
      )}

      <p>
        <strong>Rounds:</strong> {roomState?.currentRound} /{" "}
        {roomState?.maxRounds}
      </p>

      {/* Example: start button for owner */}
      {roomState?.ownerId === roomState?.owner?.id && (
        <button
          style={{
            padding: "8px 16px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "12px",
          }}
        >
          Start Game
        </button>
      )}
    </div>
  );
}

export default MultiplayerLobby;
