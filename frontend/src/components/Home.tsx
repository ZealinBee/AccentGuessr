import axios from "axios";
import { useState } from "react";
import Game from "./Game";

function Home() {
  const [currentGame, setCurrentGame] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = async () => {
    const game = await axios.get("http://localhost:3000/game");
    console.log(game.data);
    setCurrentGame(game.data);
    setGameStarted(true);
  };

  return (
    <>
      {!gameStarted && (
        <div>
          <h1>Welcome to AccentGuessr!</h1>
          <p>
            Try to see if you can tell where this person is from by their
            English accent.
          </p>
          <button onClick={() => startGame()}>Start Game</button>
        </div>
      )}

      {gameStarted && currentGame && <Game gameData={currentGame} />}
    </>
  );
}

export default Home;
