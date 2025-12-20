import axios from "axios";
import { env } from "@/lib/env";
import { useRouter } from "next/navigation";
import useAuth from "../hooks/useAuth";
import { useState } from "react";

import "../scss/Multiplayer.scss";
import Link from "next/link";

function Multiplayer() {
  const router = useRouter();
  const { token } = useAuth();
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  const createRoomHandler = async () => {
    setIsCreatingRoom(true);
    try {
      const res = await axios.post(
        `${env.API_URL}/matches`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      const code = res.data.code;
      if (!code) {
        alert("Server is down right now, please try again later.");
        setIsCreatingRoom(false);
        return;
      }
      router.push(`/join/${code}`);
    } catch (error) {
      alert("Failed to create room. Please try again.");
      console.error("Error creating room:", error);
      setIsCreatingRoom(false);
    }
  };

  const joinRoomHandler = () => {
    const code = prompt("Enter room code:");
    if (code) {
      setIsJoiningRoom(true);
      router.push(`/join/${code}`);
    }
  };

  return (
    <div className="multiplayer-container">
      <div className="multiplayer-background-image" />
      <div className="multiplayer-background-overlay" />

      <Link
        className="multiplayer-back-home-button"
        href="/"
      >
        ← Home
      </Link>

      <div className="multiplayer-content">
        <div className="multiplayer-card">
          <h1 className="multiplayer-title">Multiplayer</h1>
          <p className="multiplayer-subtitle">
            Create a new room or join an existing one to play with friends
          </p>

          <div className="multiplayer-actions">
            <button
              className="multiplayer-create-button"
              onClick={createRoomHandler}
              disabled={isCreatingRoom || isJoiningRoom}
            >
              {isCreatingRoom ? (
                <>
                  Creating Room
                  <span className="loading-spinner" />
                </>
              ) : (
                "Create Room"
              )}
            </button>

            <div className="multiplayer-divider">or</div>

            <a
              className="multiplayer-join-link"
              onClick={joinRoomHandler}
              style={{
                pointerEvents: isCreatingRoom || isJoiningRoom ? 'none' : 'auto',
                opacity: isCreatingRoom || isJoiningRoom ? 0.6 : 1
              }}
            >
              {isJoiningRoom ? (
                <>
                  Joining Room
                  <span className="loading-spinner" />
                </>
              ) : (
                "Join Room"
              )}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Multiplayer;
