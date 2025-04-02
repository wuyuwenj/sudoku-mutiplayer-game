const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { generateSudoku, validateMove } = require('./sudoku');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Game state
const games = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('createGame', () => {
    const gameId = Math.random().toString(36).substring(7);
    const { puzzle, solution } = generateSudoku();
    
    games.set(gameId, {
      puzzle,
      solution,
      players: new Map(),
      scores: new Map(),
      lastMove: null
    });

    socket.join(gameId);
    socket.emit('gameCreated', { gameId, puzzle });
  });

  socket.on('joinGame', ({ gameId, playerName }) => {
    const game = games.get(gameId);
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    game.players.set(socket.id, playerName);
    game.scores.set(socket.id, 0);
    socket.join(gameId);

    // Send the puzzle data to the joining player
    socket.emit('gameCreated', { gameId, puzzle: game.puzzle });

    io.to(gameId).emit('playerJoined', {
      players: Object.fromEntries(game.players),
      scores: Array.from(game.scores.entries())
    });
  });

  socket.on('makeMove', ({ gameId, row, col, value }) => {
    const game = games.get(gameId);
    if (!game) return;

    const isValid = validateMove(game.solution, row, col, value);
    
    if (isValid) {
      game.puzzle[row][col] = value;  // Only update the board for valid moves
      game.scores.set(socket.id, game.scores.get(socket.id) + 1);  // Add 1 point for correct move
    } else {
      game.scores.set(socket.id, game.scores.get(socket.id) - 1);  // Subtract 1 point for incorrect move
    }
    
    game.lastMove = { row, col, value, player: game.players.get(socket.id) };

    io.to(gameId).emit('moveMade', {
      row,
      col,
      value: isValid ? value : 0,  // Send 0 for invalid moves to clear the cell
      player: game.players.get(socket.id),
      scores: Array.from(game.scores.entries())
    });
  });

  socket.on('disconnect', () => {
    games.forEach((game, gameId) => {
      if (game.players.has(socket.id)) {
        game.players.delete(socket.id);
        game.scores.delete(socket.id);
        io.to(gameId).emit('playerLeft', {
          players: Array.from(game.players.values()),
          scores: Array.from(game.scores.entries())
        });
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 