// const express = require('express');
// const app = express();
// const cors = require('cors');   
// const morgan = require('morgan');
// const router = require('./routes/index');



// app.use(morgan('dev'));
// app.use(cors());
// app.use(express.json());
// app.use(router)



// module.exports = app;


// const express = require('express');
// const http = require('http');
// const cors = require('cors');
// const morgan = require('morgan');
// const { Server } = require('socket.io');
// const router = require('./routes/index');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:5173',
//     methods: ['GET', 'POST']
//   }
// });

// app.use(morgan('dev'));
// app.use(cors());
// app.use(express.json());
// app.use(router);

// // WebRTC signaling code
// io.on('connection', (socket) => {
//   console.log('A user connected:', socket.id);

//   socket.on('join-room', (roomId, userId) => {
//     console.log(`User ${userId} joining room ${roomId}`);
//     socket.join(roomId);
//     socket.broadcast.to(roomId).emit('user-connected', userId);

//     socket.on('disconnect', () => {
//       console.log(`User ${userId} disconnected from room ${roomId}`);
//       socket.broadcast.to(roomId).emit('user-disconnected', userId);
//     });

//     socket.on('offer', (data) => {
//       console.log(`Offer from ${userId} in room ${roomId}`);
//       socket.broadcast.to(roomId).emit('offer', data);
//     });

//     socket.on('answer', (data) => {
//       console.log(`Answer from ${userId} in room ${roomId}`);
//       socket.broadcast.to(roomId).emit('answer', data);
//     });

//     socket.on('candidate', (data) => {
//       console.log(`Candidate from ${userId} in room ${roomId}`);
//       socket.broadcast.to(roomId).emit('candidate', data);
//     });
//   });

//   socket.on('error', (err) => {
//     console.error('Socket.IO error:', err);
//   });
// });

// server.on('error', (err) => {
//   console.error('Server error:', err);
// });


const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');
const router = require('./routes/index');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(router);

// WebRTC signaling code
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
      // console.log(`Data from ${data.username} in room ${data.room}:`, data);
      socket.broadcast.to(data.room).emit('data', data);
    } else {
      console.warn('Received unknown data type:', type);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Handle user disconnection and room cleanup if needed
  });

  socket.on('error', (err) => {
    console.error('Socket.IO error:', err);
  });
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

module.exports = server

