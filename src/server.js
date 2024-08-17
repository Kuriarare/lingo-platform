const fs = require('fs');
const http = require('http'); 
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');
const router = require('./routes/index');

const app = express();

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(router);


const server = http.createServer(app); 


const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST']
  }
});


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
    
  });

  socket.on('error', (err) => {
    console.error('Socket.IO error:', err);
  });
});


server.on('error', (err) => {
  console.error('Server error:', err);
});

module.exports = server;
