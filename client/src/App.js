import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import JoinPage from './pages/JoinPage';
import ChatRoom from './pages/ChatRoom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JoinPage />} />
        <Route path="/chat" element={<ChatRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
