const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// POST /messages – Save a new message
router.post('/', async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save message', details: err });
  }
});

// GET /messages/:room – Get all messages from a chat room
router.get('/:room', async (req, res) => {
  try {
    const roomMessages = await Message.find({ room: req.params.room });
    res.status(200).json(roomMessages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages', details: err });
  }
});

module.exports = router;
