const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const Message = require('./models/Message');

dotenv.config();

const app = express(); // ✅ Move this up
const server = http.createServer(app);

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Routes
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');

app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('✅ Chat App Backend is running');
});

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// ✅ Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('🟢 New user connected');

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`📦 User joined room: ${room}`);
  });

  socket.on('send_message', async (data) => {
    const { sender, content, room } = data;
    socket.to(room).emit('receive_message', data);

    try {
      const newMessage = new Message({ sender, content, room });
      await newMessage.save();
      console.log('✅ Message saved to MongoDB');
    } catch (err) {
      console.error('❌ Failed to save message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected');
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
