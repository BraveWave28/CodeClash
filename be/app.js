import express from 'express';
import mongoose from 'mongoose';
import router from './router/router.js';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4444;  // Use a single port (Render will provide it via env)

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use('/', router);

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
  })
  .catch((err) => {
    console.error('❌ Error while connecting to DB:', err);
  });

// Create one HTTP server for Express + Socket.IO
const server = createServer(app);

// Socket.IO server setup
const io = new Server(server, {
  cors: { origin: '*', credentials: true }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  socket.on('join-room', (roomid) => {
    socket.join(roomid);
    socket.data.roomid = roomid;
    console.log(`${socket.id} joined room ${roomid}`);
  });

  socket.on('update-code', ({ NewCode, roomid }) => {
    if (socket.data.roomid === roomid) {
      socket.to(roomid).emit('send-code', NewCode);
    }
  });

  socket.on('update-input', ({ inputValue, roomid }) => {
    if (socket.data.roomid === roomid) {
      socket.to(roomid).emit('send-input', inputValue);
    }
  });

  socket.on('update-output', ({ outputVal, roomid }) => {
    if (socket.data.roomid === roomid) {
      socket.to(roomid).emit('send-output', outputVal);
    }
  });

  socket.on('update-language', ({ language, roomid }) => {
    console.log(`Language updated to ${language} in room ${roomid}`);
    socket.to(roomid).emit('send-language', language);
  });

  socket.on('send-message', ({ message, roomid, senderUserName }) => {
    if (socket.data.roomid === roomid) {
      const fullMessage = {
        text: message.text,
        sender: socket.id,
        senderUserName,
      };
      socket.to(roomid).emit('receive-message', fullMessage);
      console.log(`Message sent in room ${roomid}:`, fullMessage);
    } else {
      console.warn(`Socket ${socket.id} tried to send a message to an invalid room ${roomid}`);
    }
  });

  socket.on('disconnect-room', (roomid) => {
    socket.leave(roomid);
    socket.data.roomid = null;
    console.log(`${socket.id} left room ${roomid}`);
  });
});

// Listen on single PORT
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});