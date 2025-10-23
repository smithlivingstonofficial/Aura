import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './components/ChatMessage';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm Aura, your on-device AI. How can I help you today?" }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatWindowRef = useRef(null);

  // Effect to check for model availability and create a session
  useEffect(() => {
    const initializeModel = async () => {
      try {
        if (window.ai && (await window.ai.languageModel.availability()) === 'available') {
          console.log("Gemini Nano is available. Creating session...");
          const newSession = await window.ai.languageModel.startSession({
            topK: 3, // Optional: Configure model parameters
          });
          setSession(newSession);
          console.log("Session created successfully.");
        } else {
          console.log("Gemini Nano not available.");
          setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, Gemini Nano is not available on your browser. Please check your Chrome settings." }]);
        }
      } catch (error) {
        console.error("Error initializing model:", error);
        setMessages(prev => [...prev, { role: 'assistant', content: "An error occurred while setting up the AI model." }]);
      }
    };
    initializeModel();
  }, []);

  // Effect to scroll to the bottom of the chat window on new messages
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !session || isLoading) return;

    const userMessage = { role: 'user', content: inputText };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInputText('');

    try {
      // Add an empty placeholder for the assistant's streaming response
      setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

      const stream = await session.promptStreaming(userMessage.content);

      for await (const chunk of stream) {
        // Update the last message (the assistant's placeholder) with the new chunk
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          const updatedLastMessage = { ...lastMessage, content: lastMessage.content + chunk };
          return [...prev.slice(0, -1), updatedLastMessage];
        });
      }
    } catch (error) {
      console.error("Error during model prompt:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const modelStatus = session ? 'Online' : 'Offline';

  return (
    <div className="App">
      <header className="header">
        <h1>Aura AI Chat</h1>
        <div className={`status ${modelStatus.toLowerCase()}`}>
          Model Status: {modelStatus}
        </div>
      </header>

      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={session ? "Ask Aura anything..." : "Waiting for model..."}
          disabled={!session || isLoading}
          autoFocus
        />
        <button type="submit" disabled={!session || isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}

export default App;