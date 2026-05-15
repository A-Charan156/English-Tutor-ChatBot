import { createContext, useContext, useEffect, useState } from "react";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const chat = async (message) => {
    setLoading(true);
    setMessage(null); // Clear current message immediately
    
    try {
      const data = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      
      if (!data.ok) throw new Error(`HTTP error! status: ${data.status}`);
      
      const resp = (await data.json()).messages;
      setMessages(resp); // Replace instead of append to prevent stacking
      
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([{
        text: "Sorry, I'm having trouble responding. Please try again!",
        facialExpression: "concerned",
        animation: "Idle"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  
  const onMessagePlayed = () => {
    setMessages([]); // Clear all messages when done
    setMessage(null);
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <ChatContext.Provider value={{ chat, message, onMessagePlayed, loading, cameraZoomed, setCameraZoomed }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};