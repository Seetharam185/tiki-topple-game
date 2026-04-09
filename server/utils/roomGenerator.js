function generateRoomCode(existingCodes = []) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  do {
    code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (existingCodes.includes(code));
  return code;
}

module.exports = { generateRoomCode };
