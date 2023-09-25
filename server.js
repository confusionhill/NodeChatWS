require('@instana/collector')();
const prometheus = require('prom-client');
const WebSocket = require('ws');

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

server.on('connection', (socket) => {
  console.log('Client connected');
  userLoggedIn();
  clients.add(socket);

  socket.on('message', (message) => {
    clients.forEach((client) => {
      if (client !== socket) {
        // const metrics = {
        //   online_users: onlineUsersGauge.get(), // Get the current value of the gauge
        //   // Add more metrics here if needed
        // };
        // let mem = await metrics.online_users;
        // // Convert the metrics to a literal string format
        // const metricsString = `msg ${message} online_users ${metrics.online_users}\n`;
        // console.log(metrics.online_users);
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

console.log('WebSocket server is running on port 8081');

