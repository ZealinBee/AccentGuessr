import axios from "axios";
import { useState } from "react";
import Game from "./Game";
import "../scss/Home.scss";

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
        <div className="home-container">
          <div className="background-image" />
          <div className="background-overlay" />

          <div className="content">
            <div className="welcome-card">
              <h1 className="title">Guess the Accent</h1>
              <p className="description">
                Try to see if you can tell where this person is from by their
                English accent.
              </p>
              <button onClick={() => startGame()} className="start-button">
                Start Game
              </button>
            </div>
          </div>
        </div>
      )}
      {gameStarted && currentGame && <Game gameData={currentGame} />}
    </>
  );
}

export default Home;
