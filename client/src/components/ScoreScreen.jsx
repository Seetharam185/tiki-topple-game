import React from 'react';
import { useGame } from '../context/GameContext';

const TIKI_COLORS = {
  1: 'bg-red-500', 2: 'bg-blue-500', 3: 'bg-green-500', 4: 'bg-yellow-400',
  5: 'bg-purple-500', 6: 'bg-orange-500', 7: 'bg-pink-500', 8: 'bg-teal-500', 9: 'bg-indigo-500',
};

export default function ScoreScreen() {
  const { socket, gameState, playerId, roundScores } = useGame();

  if (!gameState) return null;

  const isHost = gameState.hostId === playerId;
  const isEnded = gameState.status === 'ended';
  const isScoring = gameState.status === 'scoring';
  const showNextRound = isHost && isScoring;

  // Sort players by cumulative score desc
  const sortedPlayers = [...gameState.players].sort(
    (a, b) => (gameState.cumulativeScores?.[b.id] ?? 0) - (gameState.cumulativeScores?.[a.id] ?? 0)
  );

  const winner = isEnded ? sortedPlayers[0] : null;

  const handleNextRound = () => {
    socket.emit('nextRound', { roomCode: gameState.code });
  };

  const handleLeave = () => {
    socket.emit('leaveRoom');
  };

  const getTiebreakerLabel = () => {
    if (gameState.isFinalRound && isScoring) return '🔥 Tiebreaker Round Complete!';
    if (gameState.isFinalRound && !isEnded) return '🔥 Tiebreaker Round';
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-yellow-300 to-amber-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">{isEnded ? '🏆' : '📊'}</div>
          <h1 className="text-2xl font-extrabold text-orange-600">
            {isEnded
              ? 'Final Results'
              : getTiebreakerLabel() || `Round ${roundScores?.currentRound ?? gameState.currentRound} Results`}
          </h1>
          {!isEnded && (
            <p className="text-sm text-gray-500 mt-1">
              Round {roundScores?.currentRound ?? gameState.currentRound} of{' '}
              {roundScores?.totalRounds ?? gameState.totalRounds}
              {gameState.isFinalRound && ' (Tiebreaker)'}
            </p>
          )}
        </div>

        {/* Winner announcement */}
        {isEnded && winner && (
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-2xl p-4 mb-5 text-center">
            <p className="text-sm text-yellow-700 font-semibold mb-1">🎉 Winner!</p>
            <p className="text-2xl font-extrabold text-yellow-800">{winner.name}</p>
            <p className="text-lg font-bold text-yellow-700 mt-1">
              {gameState.cumulativeScores?.[winner.id] ?? 0} points
            </p>
          </div>
        )}

        {/* Round scores */}
        {roundScores?.roundScores && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">This Round</h2>
            <div className="space-y-2">
              {gameState.players.map((player) => (
                <div
                  key={player.id}
                  className={`flex justify-between items-center px-4 py-2 rounded-xl border ${
                    player.id === playerId ? 'bg-orange-50 border-orange-300' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <span className="font-semibold text-gray-800">
                    {player.name}
                    {player.id === playerId && <span className="text-orange-400 text-xs ml-1">(You)</span>}
                  </span>
                  <span className="font-bold text-orange-600 text-lg">
                    +{roundScores.roundScores[player.id] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
            {isEnded ? '🏅 Final Leaderboard' : '📈 Standings'}
          </h2>
          <div className="space-y-2">
            {sortedPlayers.map((player, idx) => (
              <div
                key={player.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                  idx === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'
                } ${player.id === playerId ? 'ring-2 ring-orange-300' : ''}`}
              >
                <span className="text-xl font-extrabold text-gray-400 w-6 text-center">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                </span>
                <span className="flex-1 font-semibold text-gray-800">
                  {player.name}
                  {player.id === playerId && <span className="text-orange-400 text-xs ml-1">(You)</span>}
                  {player.id === gameState.hostId && <span className="ml-1">👑</span>}
                </span>
                <span className="font-extrabold text-lg text-orange-600">
                  {gameState.cumulativeScores?.[player.id] ?? 0}
                </span>
                <span className="text-xs text-gray-400">pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tiki positions */}
        {gameState.tikiOrder && gameState.tikiOrder.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Final Pole Order</h2>
            <div className="flex flex-wrap gap-1">
              {gameState.tikiOrder.map((tikiId, idx) => (
                <span key={tikiId} className={`text-xs font-bold px-2 py-1 rounded-lg text-white ${TIKI_COLORS[tikiId]}`}>
                  {idx + 1}. Tiki {tikiId}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {showNextRound && (
            <button
              onClick={handleNextRound}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors duration-200 shadow"
            >
              {gameState.isFinalRound ? '🔥 Start Tiebreaker' : '▶ Next Round'}
            </button>
          )}
          {isEnded && (
            <div className="text-center text-gray-500 italic text-sm py-1">Game Over!</div>
          )}
          <button
            onClick={handleLeave}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition-colors duration-200"
          >
            Leave Game
          </button>
        </div>
      </div>
    </div>
  );
}
