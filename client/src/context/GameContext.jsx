import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const socketRef = useRef(null);
  const [gameState, setGameState] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [screen, setScreen] = useState('home');
  const [error, setError] = useState('');
  const [roundScores, setRoundScores] = useState(null);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    socketRef.current = socket;

    socket.on('connect', () => {
      setPlayerId(socket.id);
    });

    socket.on('updateState', (state) => {
      setGameState(state);
      if (state.status === 'lobby') setScreen('lobby');
      else if (state.status === 'playing') setScreen('game');
      else if (state.status === 'scoring') setScreen('score');
      else if (state.status === 'ended') setScreen('score');
    });

    socket.on('endRound', (payload) => {
      setRoundScores(payload);
    });

    socket.on('roomError', (msg) => {
      setError(msg);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const socket = socketRef.current;

  return (
    <GameContext.Provider
      value={{
        socket,
        gameState,
        playerName,
        setPlayerName,
        playerId,
        screen,
        setScreen,
        error,
        setError,
        roundScores,
        setRoundScores,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
