require('@instana/collector')();
const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });
const clients = new Set();

server.on('connection', (socket) => {
  console.log('Client connected');
  clients.add(socket);

  socket.on('message', (message) => {
    clients.forEach((client) => {
      if (client !== socket) {
        client.send(message);
      }
    });
  });

  socket.on('close', () => {
    console.log('Client disconnected');
    clients.delete(socket);
  });
});

console.log('WebSocket server is running on port 8080');

