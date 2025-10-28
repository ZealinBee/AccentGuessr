import { useNavigate } from "react-router-dom";
import Game from "./Game";
import Seo from "./Seo";
import "../scss/Home.scss";
import LoginButton from "./GoogleLoginButton";
import { useGame } from "../hooks/useGame";
import useAuth from "../hooks/useAuth";

function Home() {
  const navigate = useNavigate();
  const { startGame, isLoading, gameData } = useGame();
  const { isLoggedIn } = useAuth();

  return (
    <>
      <Seo
        title="Guess the Accent — AccentGuessr"
        description={`Try to identify where a speaker is from by their English accent. Short audio clips, global accents, fun learning.`}
        canonical={
          typeof window !== "undefined" ? window.location.href : undefined
        }
        url={typeof window !== "undefined" ? window.location.href : undefined}
      />
      {!gameData && (
        <>
          {!isLoggedIn && (
            <div className="absolute-button">
              <LoginButton />
            </div>
          )}

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
                  disabled={isLoading}
                  aria-busy={isLoading}
                >
                  Start Game
                  {isLoading && (
                    <>
                      <span className="loading-spinner" aria-hidden="true" />
                      <span className="sr-only">Loading…</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => navigate("/volunteer")}
                  className="start-button volunteer-button"
                >
                  Volunteer Your Accent
                </button>
              </div>
            </div>
          </div>
          <div className="buy-me-coffee-wrapper">
            <a
              href="https://buymeacoffee.com/zhiyuanliu"
              target="_blank"
              rel="noreferrer"
            >
              {" "}
              <img src="/buymecoffeebutton.png" />
            </a>
          </div>
        </>
      )}
      {gameData && <Game />}
    </>
  );
}

export default Home;
