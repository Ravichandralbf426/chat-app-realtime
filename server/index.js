const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const cors = require('cors');
app.use(express.json());
app.use(cors());

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
// Load routes
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');

// Use routes
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);


app.get('/', (req, res) => {
  res.send('✅ Chat App Backend is running');
});

mongoose.connect(process.env.MONGO_URI)

.then(() => {
  console.log('✅ MongoDB Connected');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const Message = require('./models/Message'); // make sure this is at the top

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('send_message', async (data) => {
    const { sender, content, room } = data;

    // Broadcast the message
    socket.to(room).emit('receive_message', data);

    try {
      // Save message to DB
      const newMessage = new Message({ sender, content, room });
      await newMessage.save();
      console.log('Message saved to MongoDB');
    } catch (err) {
      console.error('Failed to save message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
 
