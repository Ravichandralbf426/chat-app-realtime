import axios from 'axios';
import '../styles/ChatRoom.css';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io("https://chat-app-realtime-7r66.onrender.com"); // ✅ Your backend

function ChatRoom() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const username = query.get('username');
  const room = query.get('room');

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.emit('join_room', room);

    // ✅ Load messages from MongoDB
    axios.get(`https://chat-app-realtime-7r66.onrender.com/api/messages/${room}`)
      .then((res) => {
        console.log("✅ Messages loaded:", res.data);
        setMessages(res.data);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch old messages:", err);
      });

    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, [room]);

  const sendMessage = () => {
    if (message.trim()) {
      const msg = {
        sender: username,
        content: message,
        room,
      };
      socket.emit('send_message', msg);
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
