function applyTikiUp(tikiOrder, tikiId, amount) {
  const order = [...tikiOrder];
  const currentIndex = order.indexOf(tikiId);
  if (currentIndex === -1) return order;
  const newIndex = Math.max(0, currentIndex - amount);
  order.splice(currentIndex, 1);
  order.splice(newIndex, 0, tikiId);
  return order;
}

function applyTikiTopple(tikiOrder, tikiId) {
  const order = [...tikiOrder];
  const currentIndex = order.indexOf(tikiId);
  if (currentIndex === -1) return order;
  order.splice(currentIndex, 1);
  order.push(tikiId);
  return order;
}

function applyTikiToast(tikiOrder) {
  const order = [...tikiOrder];
  const removedTiki = order.pop();
  return { newOrder: order, removedTiki };
}

function calculateScores(players, tikiOrder, playerObjectives) {
  const scores = {};
  for (const player of players) {
    const objectives = playerObjectives[player.id] || [];
    let total = 0;
    for (const tikiId of objectives) {
      const pos = tikiOrder.indexOf(tikiId);
      if (pos === 0) total += 3;
      else if (pos === 1) total += 2;
      else if (pos === 2) total += 1;
      // pos === -1 means removed (tikiToast'd), 0 points
    }
    scores[player.id] = total;
  }
  return scores;
}

function assignObjectives(players, tikiIds) {
  const objectives = {};
  players.forEach((player) => {
    const shuffled = [...tikiIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    objectives[player.id] = shuffled.slice(0, 3);
  });
  return objectives;
}

function checkRoundEnd(tikiOrder, playerHands) {
  if (tikiOrder.length <= 3) return true;
  const allUsed = Object.values(playerHands).every((hand) =>
    hand.every((card) => card.used)
  );
  return allUsed;
}

function getNextTurn(currentTurn, players) {
  const total = players.length;
  let next = (currentTurn + 1) % total;
  let checked = 0;
  while (players[next].disconnected && checked < total) {
    next = (next + 1) % total;
    checked++;
  }
  return next;
}

module.exports = {
  applyTikiUp,
  applyTikiTopple,
  applyTikiToast,
  calculateScores,
  assignObjectives,
  checkRoundEnd,
  getNextTurn,
};
