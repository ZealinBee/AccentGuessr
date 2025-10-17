import axios from "axios";
import { useState } from "react";
import Game from "./Game";
import "../scss/Home.scss";

function Home() {
  const [currentGame, setCurrentGame] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  const startGame = async () => {
    try {
      setLoading(true);
      const game = await axios.get(`${import.meta.env.VITE_API_URL}/game`);
      console.log(game.data);
      setCurrentGame(game.data);
      setGameStarted(true);
    } catch (error) {
      console.error("Error fetching game data:", error);
    } finally {
      setLoading(false);
    }
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
              <button
                onClick={() => startGame()}
                className="start-button"
                disabled={loading}
                aria-busy={loading}
              >
                Start Game
                {loading && (
                  <>
                    <span className="loading-spinner" aria-hidden="true" />
                    <span className="sr-only">Loading…</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {gameStarted && currentGame && (
        <Game
          gameData={currentGame}
          gameStarted={gameStarted}
          setGameStarted={setGameStarted}
        />
      )}
    </>
  );
}

export default Home;
