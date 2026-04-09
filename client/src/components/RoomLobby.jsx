import React from 'react';
import { useGame } from '../context/GameContext';

export default function RoomLobby() {
  const { socket, gameState, playerId, error, setError } = useGame();

  if (!gameState) return null;

  const isHost = gameState.hostId === playerId;
  const canStart = gameState.players.length >= 2;

  const handleStart = () => {
    setError('');
    socket.emit('startGame', { roomCode: gameState.code });
  };

  const handleLeave = () => {
    socket.emit('leaveRoom');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-yellow-300 to-amber-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🗿</div>
          <h1 className="text-3xl font-extrabold text-orange-600">Game Lobby</h1>
        </div>

        {/* Room code */}
        <div className="bg-orange-100 rounded-2xl p-4 mb-6 text-center border-2 border-orange-300">
          <p className="text-sm text-orange-600 font-semibold mb-1">Room Code</p>
          <p className="text-4xl font-extrabold tracking-widest text-orange-700 font-mono">
            {gameState.code}
          </p>
          <p className="text-xs text-gray-500 mt-1">Share this code with other players</p>
        </div>

        {/* Room info */}
        <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
          <span>
            Players: <strong>{gameState.players.length}</strong> / {gameState.maxPlayers}
          </span>
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">
            Waiting for players...
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Players list */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Players</h2>
          <ul className="space-y-2">
            {gameState.players.map((player) => (
              <li
                key={player.id}
                className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {player.id === gameState.hostId ? '👑' : '🙂'}
                  </span>
                  <span className="font-semibold text-gray-800">
                    {player.name}
                    {player.id === playerId && (
                      <span className="ml-2 text-xs text-orange-500 font-normal">(You)</span>
                    )}
                  </span>
                </div>
                {player.id === gameState.hostId && (
                  <span className="text-xs bg-orange-200 text-orange-700 px-2 py-1 rounded-full font-semibold">
                    Host
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          {isHost && (
            <button
              onClick={handleStart}
              disabled={!canStart}
              className={`w-full font-bold py-3 rounded-xl transition-colors duration-200 shadow-md ${
                canStart
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {canStart ? '🚀 Start Game' : `Need ${2 - gameState.players.length} more player(s)`}
            </button>
          )}
          {!isHost && (
            <p className="text-center text-sm text-gray-500 italic">Waiting for host to start...</p>
          )}
          <button
            onClick={handleLeave}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition-colors duration-200"
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
}
