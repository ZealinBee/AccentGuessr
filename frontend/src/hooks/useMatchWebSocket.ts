import { useEffect, useState } from "react";
import { getSocket } from "../lib/socket";

type Events = {
  onMatchJoined?: (data: any) => void;
  onPlayerJoined?: (data: any) => void;
  onPlayerLeft?: (data: any) => void;
  onMatchStarted?: (data: any) => void;
  onGuessConfirmed?: (data: any) => void;
  onNewRound?: (data: any) => void;
  onMatchFinished?: (data: any) => void;
};

export function useMatchSocket(matchCode: number, opts: Events = {}) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    const eventHandlers = {
      connect: handleConnect,
      disconnect: handleDisconnect,
      match_joined: opts.onMatchJoined,
      player_joined: opts.onPlayerJoined,
      player_left: opts.onPlayerLeft,
      match_started: opts.onMatchStarted,
      guess_confirmed: opts.onGuessConfirmed,
      match_finished: opts.onMatchFinished,
      new_round: opts.onNewRound,
    };

    for (const [event, handler] of Object.entries(eventHandlers)) {
      if (handler) socket.on(event, handler);
      else socket.on(event, (data) => console.log(`Received ${event}:`, data));
    }

    return () => {
      for (const [event, handler] of Object.entries(eventHandlers)) {
        if (handler) socket.off(event, handler);
        else socket.off(event);
      }
    };
  }, [
    opts.onMatchJoined,
    opts.onPlayerJoined,
    opts.onPlayerLeft,
    opts.onMatchStarted,
    opts.onGuessConfirmed,
    opts.onMatchFinished,
    opts.onNewRound,
  ]);

  const joinMatch = (playerName: string, isGuest: boolean) => {
    const socket = getSocket();
    console.log("Emitting join_match", { matchCode, playerName, isGuest });
    socket.emit("join_match", { matchCode, playerName, isGuest });
  };

  const startMatch = () => {
    const socket = getSocket();
    console.log("Emitting start_match", { matchCode });
    socket.emit("start_match", { matchCode });
  };

  const confirmGuess = (lng: number, lat: number, score: number) => {
    const socket = getSocket();
    console.log("Emitting confirm_guess", {
      matchCode,
      guessLong: lng,
      guessLat: lat,
      score,
    });
    socket.emit("confirm_guess", {
      matchCode,
      guessLong: lng,
      guessLat: lat,
      score,
    });
  };

  return { connected, joinMatch, startMatch, confirmGuess };
}
