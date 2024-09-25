// Existing imports and setup code
const fs = require('fs');
const https = require('https');  // Use HTTPS instead of HTTP
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');
const router = require('./routes/index');
const Message = require('./models/Chat');
const app = express();

// CORS setup
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(router);

// SSL Certificate paths
const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/srv570363.hstgr.cloud-0001/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/srv570363.hstgr.cloud-0001/fullchain.pem')
};

// HTTPS and Socket.IO setup
const server = https.createServer(sslOptions, app);  // Use HTTPS server
const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a room
  socket.on('join', async ({ username, room }) => {
    console.log(`User ${username} joining room ${room}`);
    socket.join(room);
    socket.broadcast.to(room).emit('ready', { username });

    // Load previous messages
    const messages = await Message.find({ room })
      .sort({ timestamp: 1 })
      .limit(50);
    socket.emit('loadMessages', messages);
  });

  // Handle new chat messages
  socket.on('chat', async (data) => {
    try {
      const messageData = {
        username: data.username,
        room: data.room,
        message: data.message,
        timestamp: new Date()
      };
      await Message.create(messageData);
      io.to(data.room).emit('chat', messageData);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  // Handle WebRTC signaling data
  socket.on('data', (data) => {
    const { type, ...rest } = data;
    if (type === 'offer' || type === 'answer' || type === 'candidate') {
      socket.broadcast.to(data.room).emit('data', data);
    } else {
      console.warn('Received unknown data type:', type);
    }
  });

  // Handle screen sharing state
  socket.on('screenSharing', (data) => {
    console.log('Received screenSharing event:', data);
    const { room, isScreenSharing, senderId } = data;
    
    // Log the room and senderId for debugging
    console.log(`Room: ${room}, Sender ID: ${senderId}`);
    
    socket.broadcast.to(room).emit('screenSharing', { isScreenSharing, senderId });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  // Handle socket errors
  socket.on('error', (err) => {
    console.error('Socket.IO error:', err);
  });
});

// Server error handling
server.on('error', (err) => {
  console.error('Server error:', err);
});

module.exports = server;
