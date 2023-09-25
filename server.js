//require('@instana/collector')();
const prometheus = require('prom-client');
const WebSocket = require('ws');
const express = require('express');
const app = express();

const server = new WebSocket.Server({ port: 8081 });
const clients = new Set();

const onlineUsersGauge = new prometheus.Gauge({
  name: 'online_users',
  help: 'Number of online users in the application',
});

function userLoggedIn() {
  onlineUsersGauge.inc();
}

function userLoggedOut() {
  onlineUsersGauge.dec();
}

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  let resp = await prometheus.register.metrics()
  res.end(resp);
});

server.on('connection', (socket) => {
  console.log('Client connected');
  userLoggedIn();
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
    userLoggedOut();
    clients.delete(socket);
  });
});

app.listen(8082, () => {
  console.log(`Server is running on port 8082`);
});

console.log('WebSocket server is running on port 8081');

