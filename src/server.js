const fs = require('fs');
const https = require('https');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');
const router = require('./routes/index');

const app = express();

// Configura CORS correctamente
app.use(cors({
  origin: 'https://srv570363.hstgr.cloud', // Permite solicitudes desde este origen
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(router);

// Path to SSL certificate and key files
const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/backend.srv570363.hstgr.cloud/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/backend.srv570363.hstgr.cloud/fullchain.pem')
};

// Crear el servidor HTTPS
const server = https.createServer(sslOptions, app);

// Configurar Socket.IO con CORS
const io = new Server(server, {
  cors: {
    origin: 'https://srv570363.hstgr.cloud', // Permite conexiones desde este origen
    methods: ['GET', 'POST']
  }
});

// Manejo de conexiones WebSocket
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', ({ username, room }) => {
    console.log(`User ${username} joining room ${room}`);
    socket.join(room);
    socket.broadcast.to(room).emit('ready', { username });
  });

  socket.on('data', (data) => {
    const { type, ...rest } = data;
    if (type === 'offer' || type === 'answer' || type === 'candidate') {
      socket.broadcast.to(data.room).emit('data', data);
    } else {
      console.warn('Received unknown data type:', type);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Manejo de la desconexión del usuario y limpieza de la sala si es necesario
  });

  socket.on('error', (err) => {
    console.error('Socket.IO error:', err);
  });
});

// Manejo de errores del servidor
server.on('error', (err) => {
  console.error('Server error:', err);
});

module.exports = server;

