const { v4: uuidv4 } = require('uuid');

function generateCards(playerCount) {
  let templates;
  if (playerCount === 2) {
    templates = [
      { type: 'tikiUp', amount: 1 },
      { type: 'tikiUp', amount: 1 },
      { type: 'tikiUp', amount: 2 },
      { type: 'tikiUp', amount: 3 },
      { type: 'tikiToast', amount: null },
      { type: 'tikiToast', amount: null },
      { type: 'tikiTopple', amount: null },
    ];
  } else {
    templates = [
      { type: 'tikiUp', amount: 1 },
      { type: 'tikiUp', amount: 2 },
      { type: 'tikiUp', amount: 3 },
      { type: 'tikiToast', amount: null },
      { type: 'tikiToast', amount: null },
      { type: 'tikiTopple', amount: null },
    ];
  }

  return templates.map((t) => ({ id: uuidv4(), type: t.type, amount: t.amount, used: false }));
}

module.exports = { generateCards };
