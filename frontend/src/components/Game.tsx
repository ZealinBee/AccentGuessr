import { useEffect, useState } from "react";
import type { Clip } from "../types/Clip";
import Map from "./Map";

interface GameProps {
  gameData: Clip[];
  gameStarted: boolean;
  setGameStarted: (started: boolean) => void;
}
function Game({ gameData, gameStarted, setGameStarted }: GameProps) {
  const [gameRound, setGameRound] = useState(0);


  return (
    <div>
      <Map
        roundData={gameData[gameRound]}
        gameRound={gameRound}
        setGameRound={setGameRound}
        setGameStarted={setGameStarted}
      />
    </div>
  );
}

export default Game;
