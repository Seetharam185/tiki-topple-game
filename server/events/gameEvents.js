const { generateRoomCode } = require('../utils/roomGenerator');
const { generateCards } = require('../utils/cardGenerator');
const {
  applyTikiUp,
  applyTikiTopple,
  applyTikiToast,
  calculateScores,
  assignObjectives,
  checkRoundEnd,
  getNextTurn,
} = require('../utils/gameLogic');
const { createRoom } = require('../models/Room');

// roomCode -> room object
const rooms = new Map();

function getRoomBySocketId(socketId) {
  for (const room of rooms.values()) {
    if (room.players.some((p) => p.id === socketId)) return room;
  }
  return null;
}

function handleLeave(io, socket, room) {
  if (!room) return;

  const playerIndex = room.players.findIndex((p) => p.id === socket.id);
  if (playerIndex === -1) return;

  const wasHost = room.hostId === socket.id;
  room.players.splice(playerIndex, 1);

  if (room.players.length === 0) {
    rooms.delete(room.code);
    return;
  }

  // Reassign host if needed
  if (wasHost) {
    room.hostId = room.players[0].id;
  }

  // If game in progress and only 1 player left, end the game
  if (room.status === 'playing' && room.players.length < 2) {
    room.status = 'ended';
  }

  // Adjust currentTurn index if it's out of bounds
  if (room.currentTurn >= room.players.length) {
    room.currentTurn = 0;
  }

  // Clean up player's hand and objectives
  delete room.playerHands[socket.id];
  delete room.playerObjectives[socket.id];
  delete room.cumulativeScores[socket.id];

  io.to(room.code).emit('updateState', room);
}

function registerGameEvents(io, socket) {
  // ---------- createRoom ----------
  socket.on('createRoom', ({ playerName, maxPlayers }) => {
    const existingCodes = Array.from(rooms.keys());
    const code = generateRoomCode(existingCodes);
    const room = createRoom(code, socket.id, maxPlayers);
    room.players.push({ id: socket.id, name: playerName, score: 0, disconnected: false });
    room.cumulativeScores[socket.id] = 0;
    rooms.set(code, room);
    socket.join(code);
    socket.emit('updateState', room);
  });

  // ---------- joinRoom ----------
  socket.on('joinRoom', ({ roomCode, playerName }) => {
    const room = rooms.get(roomCode.toUpperCase());
    if (!room) {
      socket.emit('roomError', 'Room not found.');
      return;
    }
    if (room.status !== 'lobby') {
      socket.emit('roomError', 'Game already in progress.');
      return;
    }
    if (room.players.length >= room.maxPlayers) {
      socket.emit('roomError', 'Room is full.');
      return;
    }
    room.players.push({ id: socket.id, name: playerName, score: 0, disconnected: false });
    room.cumulativeScores[socket.id] = 0;
    socket.join(roomCode.toUpperCase());
    io.to(room.code).emit('updateState', room);
  });

  // ---------- leaveRoom ----------
  socket.on('leaveRoom', () => {
    const room = getRoomBySocketId(socket.id);
    handleLeave(io, socket, room);
  });

  // ---------- startGame ----------
  socket.on('startGame', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    if (room.hostId !== socket.id) {
      socket.emit('roomError', 'Only the host can start the game.');
      return;
    }
    if (room.players.length < 2) {
      socket.emit('roomError', 'Need at least 2 players to start.');
      return;
    }

    room.tikiOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    room.removedTikis = [];
    room.playerObjectives = assignObjectives(room.players, room.tikiOrder);
    room.playerHands = {};
    for (const player of room.players) {
      room.playerHands[player.id] = generateCards(room.players.length);
    }
    room.totalRounds = room.players.length;
    room.currentRound = 1;
    room.currentTurn = 0;
    room.isFinalRound = false;
    room.roundFirstMove = true;
    room.status = 'playing';
    // Reset cumulative scores
    for (const player of room.players) {
      room.cumulativeScores[player.id] = 0;
    }

    io.to(room.code).emit('updateState', room);
  });

  // ---------- playerMove ----------
  socket.on('playerMove', ({ roomCode, cardId, tikiId }) => {
    const room = rooms.get(roomCode);
    if (!room || room.status !== 'playing') return;

    const currentPlayer = room.players[room.currentTurn];
    if (!currentPlayer || currentPlayer.id !== socket.id) {
      socket.emit('roomError', 'Not your turn.');
      return;
    }

    const hand = room.playerHands[socket.id];
    const card = hand && hand.find((c) => c.id === cardId);
    if (!card || card.used) {
      socket.emit('roomError', 'Invalid card.');
      return;
    }

    // Apply action
    if (card.type === 'tikiToast') {
      if (room.roundFirstMove) {
        socket.emit('roomError', 'Cannot use Tiki Toast as the first move of a round.');
        return;
      }
      const { newOrder, removedTiki } = applyTikiToast(room.tikiOrder);
      room.tikiOrder = newOrder;
      if (removedTiki !== undefined) room.removedTikis.push(removedTiki);
    } else if (card.type === 'tikiUp') {
      if (!room.tikiOrder.includes(tikiId)) {
        socket.emit('roomError', 'Invalid tiki selection.');
        return;
      }
      room.tikiOrder = applyTikiUp(room.tikiOrder, tikiId, card.amount);
    } else if (card.type === 'tikiTopple') {
      if (!room.tikiOrder.includes(tikiId)) {
        socket.emit('roomError', 'Invalid tiki selection.');
        return;
      }
      room.tikiOrder = applyTikiTopple(room.tikiOrder, tikiId);
    }

    card.used = true;
    room.roundFirstMove = false;

    // Check round end
    if (checkRoundEnd(room.tikiOrder, room.playerHands)) {
      const roundScores = calculateScores(room.players, room.tikiOrder, room.playerObjectives);
      room.lastRoundScores = roundScores;

      for (const [playerId, pts] of Object.entries(roundScores)) {
        room.cumulativeScores[playerId] = (room.cumulativeScores[playerId] || 0) + pts;
      }

      room.status = 'scoring';

      const endRoundPayload = {
        roundScores,
        cumulativeScores: room.cumulativeScores,
        currentRound: room.currentRound,
        totalRounds: room.totalRounds,
        isFinalRound: room.isFinalRound,
      };

      // Determine if game is truly over
      if (room.isFinalRound) {
        // Tiebreaker just finished → end game
        room.status = 'ended';
      } else if (room.currentRound >= room.totalRounds) {
        // Last regular round — check for tie
        const scores = Object.values(room.cumulativeScores);
        const maxScore = Math.max(...scores);
        const topCount = scores.filter((s) => s === maxScore).length;
        if (topCount >= 2) {
          room.isFinalRound = true;
          // status stays 'scoring' until nextRound
        } else {
          room.status = 'ended';
        }
      }

      io.to(room.code).emit('endRound', endRoundPayload);
      io.to(room.code).emit('updateState', room);
      return;
    }

    // Advance turn
    room.currentTurn = getNextTurn(room.currentTurn, room.players);
    io.to(room.code).emit('updateState', room);
  });

  // ---------- nextRound ----------
  socket.on('nextRound', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;

    if (room.isFinalRound && room.status === 'scoring') {
      // The isFinalRound flag was set after last regular round — now start tiebreaker
      // Keep isFinalRound = true so after THIS round we set ended
    }

    room.tikiOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    room.removedTikis = [];
    room.playerObjectives = assignObjectives(room.players, room.tikiOrder);
    room.playerHands = {};
    for (const player of room.players) {
      room.playerHands[player.id] = generateCards(room.players.length);
    }
    room.currentRound += 1;
    room.currentTurn = 0;
    room.roundFirstMove = true;
    room.status = 'playing';

    io.to(room.code).emit('updateState', room);
  });

  // ---------- disconnect ----------
  socket.on('disconnect', () => {
    const room = getRoomBySocketId(socket.id);
    if (!room) return;

    if (room.status === 'playing') {
      // Mark as disconnected rather than remove during active game
      const player = room.players.find((p) => p.id === socket.id);
      if (player) player.disconnected = true;

      const activePlayers = room.players.filter((p) => !p.disconnected);
      if (activePlayers.length < 2) {
        room.status = 'ended';
      } else if (room.players[room.currentTurn] && room.players[room.currentTurn].id === socket.id) {
        // Skip disconnected player's turn
        room.currentTurn = getNextTurn(room.currentTurn, room.players);
      }

      if (room.hostId === socket.id && activePlayers.length > 0) {
        room.hostId = activePlayers[0].id;
      }

      io.to(room.code).emit('updateState', room);
    } else {
      handleLeave(io, socket, room);
    }
  });
}

module.exports = registerGameEvents;
