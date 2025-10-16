import { useState } from "react";
import type { Clip } from "../types/Clip";
import Map from "./Map";

interface GameProps {
  gameData: Clip[];
}
function Game({ gameData }: GameProps) {
  const [gameRound, setGameRound] = useState(0);
  return (
    <div>
      <Map
        roundData={gameData[gameRound]}
        gameRound={gameRound}
        setGameRound={setGameRound}
      />
    </div>
  );
}

export default Game;
