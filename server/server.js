const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const registerGameEvents = require('./events/gameEvents');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  registerGameEvents(io, socket);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
