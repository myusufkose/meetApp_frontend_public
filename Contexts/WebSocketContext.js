import React, { createContext, useContext, useState, useCallback } from 'react';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);

  const handleWebSocketMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'message') {
        setMessages(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('WebSocket message handling error:', error);
    }
  }, []);

  const value = {
    messages,
    setMessages,
    handleWebSocketMessage
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketContext; 