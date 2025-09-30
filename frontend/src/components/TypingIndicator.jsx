import React from 'react';
import { Bot } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="flex gap-3 max-w-[80%]">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="chat-message bg-white border border-gray-200">
          <div className="flex gap-1">
            <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></span>
            <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></span>
            <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
