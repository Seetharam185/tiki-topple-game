function createRoom(code, hostId, maxPlayers) {
  return {
    code,
    hostId,
    maxPlayers,
    players: [],
    status: 'lobby',
    tikiOrder: [],
    removedTikis: [],
    playerHands: {},
    playerObjectives: {},
    currentTurn: 0,
    currentRound: 1,
    totalRounds: 0,
    isFinalRound: false,
    roundFirstMove: true,
    cumulativeScores: {},
    lastRoundScores: {},
  };
}

module.exports = { createRoom };
