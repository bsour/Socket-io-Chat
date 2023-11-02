const express = require('express');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",  // Update this to match your frontend URL in production
    methods: ["GET", "POST"]
  }
});

// Stores messages in memory. In a real application, this should be in a database.
const messages = {};

io.on('connection', socket => {
  console.log('New user connected:', socket.id);

  socket.on('joinRoom', ({ roomId, username }) => {
    socket.join(roomId);
    if (!messages[roomId]) {
      messages[roomId] = [];
    }

    // Send history
    socket.emit('messageHistory', messages[roomId]);

    socket.on('sendMessage', content => {
      const message = { user: username, content };
      messages[roomId].push(message);
      io.to(roomId).emit('newMessage', message);
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
