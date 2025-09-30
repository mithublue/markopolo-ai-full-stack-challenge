import React from 'react';
import { Bot, User } from 'lucide-react';
import CampaignDisplay from './CampaignDisplay';

const ChatMessage = ({ message }) => {
  const isUser = message.type === 'user';
  const isCampaign = message.type === 'campaign';

  if (isCampaign) {
    return (
      <div className="flex justify-start">
        <div className="flex gap-3 max-w-[90%]">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
          </div>
          <CampaignDisplay content={message.content} isStreaming={message.isStreaming} completeData={message.completeData} />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-gray-600' : 'bg-primary-600'
          }`}>
            {isUser ? (
              <User className="w-5 h-5 text-white" />
            ) : (
              <Bot className="w-5 h-5 text-white" />
            )}
          </div>
        </div>
        <div className={`chat-message ${
          isUser 
            ? 'bg-gray-600 text-white' 
            : 'bg-white border border-gray-200 text-gray-900'
        }`}>
          <div className="text-sm whitespace-pre-wrap">
            {formatMessage(message.content)}
          </div>
          <div className={`text-xs mt-2 ${isUser ? 'text-gray-300' : 'text-gray-500'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

const formatMessage = (content) => {
  // Simple markdown-like formatting
  const parts = content.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
};

export default ChatMessage;
