import React from 'react';

const ChatMessage = ({ message }) => {
  const { role, content } = message;
  const isUser = role === 'user';

  return (
    <div className={`message-container ${isUser ? 'user' : 'assistant'}`}>
      <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
        {content || "..."}
      </div>
    </div>
  );
};

export default ChatMessage;