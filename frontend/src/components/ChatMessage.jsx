import React from 'react';
import { Bot, User } from 'lucide-react';
import CampaignDisplay from './CampaignDisplay';

const ChatMessage = ({ message }) => {
  const isUser = message.type === 'user';
  const isCampaign = message.type === 'campaign';

  if (isCampaign) {
    return (
      <div className="space-y-4">
        <CampaignDisplay content={message.content} isStreaming={message.isStreaming} completeData={message.completeData} />
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%]">
          <div className="bg-primary-600 text-white px-4 py-3 rounded-2xl rounded-br-md">
            <div className="text-sm whitespace-pre-wrap">
              {formatMessage(message.content)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%]">
        <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl rounded-bl-md">
          <div className="text-sm whitespace-pre-wrap">
            {formatMessage(message.content)}
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
