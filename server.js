const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let bubbles = [];

app.use(express.static('public'));

io.on('connection', (socket) => {
  socket.emit('sync-bubbles', bubbles);

  socket.on('add-bubble', (bubble) => {
    bubbles.push(bubble);
    io.emit('sync-bubbles', bubbles);

    // 自动移除 20 分钟后过期的气泡
    setTimeout(() => {
      bubbles = bubbles.filter((b) => b.id !== bubble.id);
      io.emit('sync-bubbles', bubbles);
    }, 20 * 60 * 1000);
  });

  socket.on('update-bubble', (updatedBubble) => {
    const bubble = bubbles.find((b) => b.id === updatedBubble.id);
    if (bubble && bubble.creatorId === updatedBubble.creatorId) {
      bubble.comment = updatedBubble.comment;
      io.emit('sync-bubbles', bubbles);
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
