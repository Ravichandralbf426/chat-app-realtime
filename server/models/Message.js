const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  content: { type: String, required: true },
  room: { type: String, required: true },
}, { timestamps: true }); // ✅ this adds createdAt and updatedAt

module.exports = mongoose.model('Message', MessageSchema);
