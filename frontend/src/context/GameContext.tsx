import React, { createContext, useState } from "react";
import axios from "axios";
import type { Speaker } from "../types/Speaker";
import { env } from "@/lib/env";

type RoundInfo = {
  score: number;
  guessLat: number;
  guessLong: number;
  speakerId: number;
};

type GameState = {
  gameData: Speaker[] | null;
  gameRound: number;
  totalScore: number;
  allRoundInfo: { totalScore: number; rounds: RoundInfo[] };
  isLoading: boolean;
  isShowingEndScreen: boolean;
  startGame: () => Promise<void>;
  resetGame: () => void;
  pushRoundResult: (r: RoundInfo) => void;
  nextRound: () => void;
};

const GameContext = createContext<GameState | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameData, setGameData] = useState<Speaker[] | null>(null);
  const [gameRound, setGameRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [allRoundInfo, setAllRoundInfo] = useState<{ totalScore: number; rounds: RoundInfo[] }>({
    totalScore: 0,
    rounds: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isShowingEndScreen, setIsShowingEndScreen] = useState(false);

  const startGame = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = token
        ? await axios.get(`${env.API_URL}/game`, { headers: { Authorization: `Bearer ${token}` } })
        : await axios.get(`${env.API_URL}/game`);
      setGameData(res.data);
      setGameRound(0);
      setTotalScore(0);
      setAllRoundInfo({ totalScore: 0, rounds: [] });
      setIsShowingEndScreen(false);
    } catch (err) {
      console.error("startGame failed", err);
      alert("Sorry but we ran out of games, since this game is still in early stages, we need more volunteers so that we can have more games, please share it to your friends and consider volunteering yourself!");
      setGameData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetGame = () => {
    setGameData(null);
    setGameRound(0);
    setTotalScore(0);
    setAllRoundInfo({ totalScore: 0, rounds: [] });
    setIsShowingEndScreen(false);
  };

  const pushRoundResult = (r: RoundInfo) => {
    setAllRoundInfo((prev) => ({
      totalScore: prev.totalScore + r.score,
      rounds: [...prev.rounds, r],
    }));
  };

  const nextRound = () => {
    setTotalScore((s) => s + (allRoundInfo.rounds.length ? allRoundInfo.rounds[allRoundInfo.rounds.length - 1].score : 0));
    if ((gameRound ?? 0) >= 4) {
      setIsShowingEndScreen(true);
      localStorage.setItem("allRoundInfo", JSON.stringify(allRoundInfo));
      const token = localStorage.getItem("token");
      if (token) {
        axios.post(`${env.API_URL}/user/submit-game`, allRoundInfo, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(console.error);
      }
    } else {
      setGameRound((g) => g + 1);
    }
  };

  return (
    <GameContext.Provider
      value={{
        gameData,
        gameRound,
        totalScore,
        allRoundInfo,
        isLoading,
        isShowingEndScreen,
        startGame,
        resetGame,
        pushRoundResult,
        nextRound,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;