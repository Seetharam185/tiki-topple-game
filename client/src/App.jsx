import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import HomePage from './components/HomePage';
import RoomLobby from './components/RoomLobby';
import GameBoard from './components/GameBoard';
import ScoreScreen from './components/ScoreScreen';

function AppContent() {
  const { screen } = useGame();
  if (screen === 'home') return <HomePage />;
  if (screen === 'lobby') return <RoomLobby />;
  if (screen === 'game') return <GameBoard />;
  if (screen === 'score') return <ScoreScreen />;
  return <HomePage />;
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
