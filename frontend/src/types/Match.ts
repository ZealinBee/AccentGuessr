import type { Speaker } from "./Speaker";

export interface MatchPlayer {
  id: number;
  matchId: number;
  userId: string | null;
  isGuest: boolean;
  name: string;
  orderIndex: number;
  createdAt: string;
}

export interface Match {
  id: number;
  code: number;
  status: "waiting" | "in_progress" | "ended";
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  currentRound: number;
  maxRounds: number;
  ownerId: number;
  owner: MatchPlayer;
  matchPlayers: MatchPlayer[];
  matchRounds: MatchRound[];
}

export interface PlayerGuess {
  id: number;
  roundId: number;
  playerId: number;
  player?: MatchPlayer;

  guessLat: number;
  guessLong: number;
  score?: number | null;
  submittedAt: string;
}

export interface MatchRound {
  id: number;
  matchId: number;
  roundIndex: number;
  speakerId: number;
  speaker: Speaker;

  startedAt: string;
  endedAt: string | null;
  isResolved: boolean;

  guesses: PlayerGuess[];
}