import { useState } from "react";
import Map from "./Map";
import type { Speaker } from "../types/Speaker";
import EndScreen from "./EndScreen";

interface GameProps {
  gameData: Speaker[];
}

function Game({ gameData }: GameProps) {
  const [gameRound, setGameRound] = useState(0);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  return (
    <div>
      {showEndScreen ? (
        <EndScreen totalScore={totalScore} />
      ) : (
        <Map
          roundData={gameData[gameRound]}
          gameRound={gameRound}
          setGameRound={setGameRound}
          showEndScreen={showEndScreen}
          setShowEndScreen={setShowEndScreen}
          totalScore={totalScore}
          setTotalScore={setTotalScore}
        />
      )}
    </div>
  );
}

export default Game;
