import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function HomePage() {
  const { socket, setPlayerName, error, setError } = useGame();
  const [nameInput, setNameInput] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [joinCode, setJoinCode] = useState('');

  const handleCreate = () => {
    if (!nameInput.trim()) {
      setError('Please enter your name.');
      return;
    }
    setError('');
    setPlayerName(nameInput.trim());
    socket.emit('createRoom', { playerName: nameInput.trim(), maxPlayers: Number(maxPlayers) });
  };

  const handleJoin = () => {
    if (!nameInput.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!joinCode.trim()) {
      setError('Please enter a room code.');
      return;
    }
    setError('');
    setPlayerName(nameInput.trim());
    socket.emit('joinRoom', { roomCode: joinCode.trim().toUpperCase(), playerName: nameInput.trim() });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-yellow-300 to-amber-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-2">🗿</div>
          <h1 className="text-4xl font-extrabold text-orange-600 tracking-wide">Tiki Topple</h1>
          <p className="text-gray-500 mt-1">Multiplayer Strategy Card Game</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Player name */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Enter your name"
            className="w-full border-2 border-orange-300 rounded-xl px-4 py-2 focus:outline-none focus:border-orange-500 text-gray-800"
            maxLength={20}
          />
        </div>

        {/* Create room */}
        <div className="bg-orange-50 rounded-2xl p-5 mb-4 border border-orange-200">
          <h2 className="text-lg font-bold text-orange-700 mb-3">🌴 Create a Room</h2>
          <div className="flex items-center gap-3 mb-3">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Max Players:</label>
            <select
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value)}
              className="flex-1 border-2 border-orange-300 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 bg-white text-gray-800"
            >
              <option value={2}>2 Players</option>
              <option value={3}>3 Players</option>
              <option value={4}>4 Players</option>
            </select>
          </div>
          <button
            onClick={handleCreate}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors duration-200 shadow-md"
          >
            Create Room
          </button>
        </div>

        {/* Join room */}
        <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-200">
          <h2 className="text-lg font-bold text-yellow-700 mb-3">🎯 Join a Room</h2>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter room code (e.g. ABC123)"
            className="w-full border-2 border-yellow-300 rounded-xl px-4 py-2 mb-3 focus:outline-none focus:border-yellow-500 text-gray-800 uppercase tracking-widest"
            maxLength={6}
          />
          <button
            onClick={handleJoin}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl transition-colors duration-200 shadow-md"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}
