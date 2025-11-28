'use client'

import dynamic from 'next/dynamic';
import EndScreen from "./EndScreen";
import { useGame } from "../hooks/useGame";

// Dynamically import Map component with no SSR to avoid Mapbox issues
const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.5rem'
  }}>Loading map...</div>
});

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
