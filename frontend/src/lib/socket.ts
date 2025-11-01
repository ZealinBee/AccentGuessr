import { io, Socket } from "socket.io-client";

const WS_BASE = import.meta.env.VITE_API_URL
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
