import { io, Socket } from "socket.io-client";
import { env } from "./env";

const WS_BASE = env.API_URL
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_BASE, {
      transports: ["websocket"],
      autoConnect: true,
      withCredentials: true
    });
  }
  return socket;
}
