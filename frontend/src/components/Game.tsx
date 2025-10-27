import Map from "./Map";
import EndScreen from "./EndScreen";
import { useGame } from "../hooks/useGame";

function Game() {
  const { isShowingEndScreen, totalScore, gameData, gameRound } = useGame();

  return (
    <div>
      {isShowingEndScreen && <EndScreen totalScore={totalScore} />}

      {!isShowingEndScreen && gameData && (
        <Map roundData={gameData[gameRound]} />
      )}
    </div>
  );
}

export default Game;
