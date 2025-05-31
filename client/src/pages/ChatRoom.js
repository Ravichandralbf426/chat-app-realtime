// src/pages/ChatRoom.js

import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import '../styles/ChatRoom.css';

function ChatRoom() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const username = query.get('username')?.trim();
  const room = query.get('room')?.trim();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const socketRef = useRef();

  useEffect(() => {
    // ✅ Establish WebSocket connection
    socketRef.current = io("https://chat-app-realtime-7r66.onrender.com", {
      transports: ["websocket"], // Force WebSocket
    });

    socketRef.current.on('connect', () => {
      console.log("🟢 Socket connected:", socketRef.current.id);
      socketRef.current.emit('join_room', room);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    // ✅ Fetch previously saved messages from MongoDB
    axios
      .get(`https://chat-app-realtime-7r66.onrender.com/api/messages/${room}`)
      .then((res) => {
        console.log("✅ Loaded messages from DB:", res.data);
        setMessages(res.data);
      })
      .catch((err) => {
        console.error("❌ Error loading messages:", err);
      });

    // ✅ Listen for incoming messages from server
    socketRef.current.on('receive_message', (data) => {
      console.log("📥 New message received:", data);
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [room]);

  const sendMessage = () => {
    if (message.trim()) {
      const msg = {
        sender: username,
        content: message,
        room,
      };

      console.log("📤 Sending message to backend:", msg);
      socketRef.current.emit('send_message', msg);
      setMessages((prev) => [...prev, msg]);
      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      <h2>Room: {room}</h2>

      <div className="message-list">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.sender}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatRoom;
