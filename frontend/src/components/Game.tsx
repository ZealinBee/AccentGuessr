import {  useState } from "react";
import Map from "./Map";
import type { Speaker } from "../types/Speaker";

interface GameProps {
  gameData: Speaker[];
  setGameStarted: (started: boolean) => void;
}
function Game({ gameData, setGameStarted }: GameProps) {
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
