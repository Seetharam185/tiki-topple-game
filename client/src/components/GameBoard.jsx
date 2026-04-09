import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import CardComponent from './CardComponent';

const TIKI_COLORS = {
  1: 'bg-red-500',
  2: 'bg-blue-500',
  3: 'bg-green-500',
  4: 'bg-yellow-400',
  5: 'bg-purple-500',
  6: 'bg-orange-500',
  7: 'bg-pink-500',
  8: 'bg-teal-500',
  9: 'bg-indigo-500',
};

const TIKI_TEXT_COLORS = {
  1: 'text-red-700',
  2: 'text-blue-700',
  3: 'text-green-700',
  4: 'text-yellow-700',
  5: 'text-purple-700',
  6: 'text-orange-700',
  7: 'text-pink-700',
  8: 'text-teal-700',
  9: 'text-indigo-700',
};

export default function GameBoard() {
  const { socket, gameState, playerId, error, setError } = useGame();
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedTiki, setSelectedTiki] = useState(null);

  if (!gameState) return null;

  const myTurn = gameState.players[gameState.currentTurn]?.id === playerId;
  const myHand = gameState.playerHands?.[playerId] || [];
  const myObjectives = gameState.playerObjectives?.[playerId] || [];
  const currentPlayerName = gameState.players[gameState.currentTurn]?.name || '';

  const handleCardClick = (card) => {
    if (!myTurn || card.used) return;
    setSelectedCard(card);
    if (card.type === 'tikiToast') setSelectedTiki(null);
  };

  const handleTikiClick = (tikiId) => {
    if (!myTurn) return;
    if (!selectedCard || selectedCard.type === 'tikiToast') return;
    setSelectedTiki(tikiId === selectedTiki ? null : tikiId);
  };

  const canPlay = () => {
    if (!myTurn || !selectedCard) return false;
    if (selectedCard.type === 'tikiToast') return true;
    return selectedTiki !== null;
  };

  const handlePlay = () => {
    if (!canPlay()) return;
    setError('');
    socket.emit('playerMove', {
      roomCode: gameState.code,
      cardId: selectedCard.id,
      tikiId: selectedTiki,
    });
    setSelectedCard(null);
    setSelectedTiki(null);
  };

  const handleLeave = () => {
    socket.emit('leaveRoom');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-yellow-300 to-amber-500 p-3 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="bg-white rounded-2xl px-4 py-2 shadow">
          <span className="font-bold text-orange-700 text-sm">
            Round {gameState.currentRound} / {gameState.totalRounds}
            {gameState.isFinalRound && ' 🔥 Tiebreaker!'}
          </span>
        </div>
        <div className="text-2xl">🗿</div>
        <button
          onClick={handleLeave}
          className="bg-white text-gray-600 hover:bg-gray-100 text-sm font-semibold px-3 py-2 rounded-xl shadow transition-colors"
        >
          Leave
        </button>
      </div>

      {/* Turn indicator */}
      <div className={`rounded-2xl px-4 py-2 mb-3 text-center shadow ${myTurn ? 'bg-green-500 text-white' : 'bg-white text-gray-700'}`}>
        {myTurn ? (
          <span className="font-bold text-lg">⭐ Your Turn!</span>
        ) : (
          <span className="font-semibold">
            <span className="text-orange-500">⏳</span> {currentPlayerName}'s turn
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg mb-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 flex-1 overflow-hidden">
        {/* Tiki pole */}
        <div className="bg-white rounded-3xl shadow-xl p-3 flex flex-col items-center min-w-[130px]">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Totem Pole</div>
          <div className="flex flex-col gap-1 w-full overflow-y-auto">
            {gameState.tikiOrder.map((tikiId, idx) => {
              const isObjective = myObjectives.includes(tikiId);
              const isSelected = selectedTiki === tikiId;
              const isClickable = myTurn && selectedCard && selectedCard.type !== 'tikiToast';

              return (
                <div
                  key={tikiId}
                  onClick={() => handleTikiClick(tikiId)}
                  className={`
                    flex items-center gap-2 rounded-xl px-2 py-2 border-2 transition-all duration-150
                    ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                    ${isSelected ? 'border-blue-500 scale-105 shadow-md' : 'border-transparent'}
                    ${TIKI_COLORS[tikiId]} text-white
                  `}
                >
                  <span className="font-bold text-sm w-5 text-right opacity-70">{idx + 1}.</span>
                  <span className="font-extrabold text-sm flex-1">Tiki {tikiId}</span>
                  {isObjective && <span className="text-yellow-200 text-sm">⭐</span>}
                </div>
              );
            })}
          </div>
          {gameState.removedTikis.length > 0 && (
            <div className="mt-3 w-full">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Removed</div>
              <div className="flex flex-wrap gap-1">
                {gameState.removedTikis.map((tikiId) => (
                  <span
                    key={tikiId}
                    className={`text-xs font-bold px-2 py-1 rounded-lg opacity-50 ${TIKI_COLORS[tikiId]} text-white`}
                  >
                    Tiki {tikiId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: players + hand */}
        <div className="flex flex-col flex-1 gap-3 overflow-hidden">
          {/* Other players */}
          <div className="bg-white rounded-2xl shadow p-3">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Players</div>
            <div className="flex flex-wrap gap-2">
              {gameState.players.map((player, idx) => {
                const isCurrentTurn = gameState.currentTurn === idx;
                const isMe = player.id === playerId;
                return (
                  <div
                    key={player.id}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border-2 transition-all
                      ${isCurrentTurn ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-600'}
                      ${player.disconnected ? 'opacity-40 line-through' : ''}
                    `}
                  >
                    {isCurrentTurn && <span>▶</span>}
                    {player.name}
                    {isMe && <span className="text-orange-400">(You)</span>}
                    {player.id === gameState.hostId && <span>👑</span>}
                    <span className="ml-1 font-bold">{gameState.cumulativeScores?.[player.id] ?? 0}pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Objectives reminder */}
          <div className="bg-yellow-50 rounded-2xl shadow p-3 border border-yellow-200">
            <div className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-1">⭐ Your Objectives</div>
            <div className="flex gap-2">
              {myObjectives.map((tikiId) => (
                <span
                  key={tikiId}
                  className={`text-xs font-bold px-2 py-1 rounded-lg text-white ${TIKI_COLORS[tikiId]}`}
                >
                  Tiki {tikiId}
                </span>
              ))}
            </div>
          </div>

          {/* Hand */}
          <div className="bg-white rounded-2xl shadow p-3 flex-1 overflow-hidden flex flex-col">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Hand</div>
            {myTurn ? (
              <>
                <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap">
                  {myHand.map((card) => (
                    <CardComponent
                      key={card.id}
                      card={card}
                      selected={selectedCard?.id === card.id}
                      disabled={!myTurn}
                      onClick={() => handleCardClick(card)}
                    />
                  ))}
                </div>
                {selectedCard && (
                  <div className="mt-2 text-xs text-gray-500 italic">
                    {selectedCard.type === 'tikiToast'
                      ? 'Click "Play Card" to remove the bottom tiki.'
                      : selectedTiki
                      ? `Selected Tiki ${selectedTiki}. Click "Play Card" to confirm.`
                      : 'Now click a tiki on the pole to target it.'}
                  </div>
                )}
                <button
                  onClick={handlePlay}
                  disabled={!canPlay()}
                  className={`mt-3 w-full py-3 rounded-xl font-bold text-sm transition-colors duration-200 ${
                    canPlay()
                      ? 'bg-orange-500 hover:bg-orange-600 text-white shadow'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {canPlay() ? '🎯 Play Card' : selectedCard ? 'Select a Tiki to target' : 'Select a Card'}
                </button>
              </>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap">
                {myHand.map((card) => (
                  <CardComponent key={card.id} card={card} selected={false} disabled={true} onClick={() => {}} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
