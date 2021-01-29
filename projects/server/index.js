const http = require('http');

const server = http.createServer((request, response) => {
  response.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET'
  });
  response.end('hey there!');
});

const socketIo = require('socket.io');
const io = socketIo(server, {
  cors: {
    origin: '*',
    credentials: false
  },
});

io.on('connection', socket => {
  console.log('Socket connection:', socket.id);
  socket.on('join-room', (roomId, userId) => {
    // Add users in the same room
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);

    socket.on('disconnect', () => {
      console.log('Socket disconnected!', roomId, userId);
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
    });
  });
});

const startServer = () => {
  const { address, port } = server.address();
  console.info(`Socket app running at ${address}:${port}`);
};

server.listen(process.env.PORT || 3000, startServer);
