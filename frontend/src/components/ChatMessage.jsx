/**
 * CHAT MESSAGE COMPONENT
 * =====================
 * 
 * This component renders individual chat messages in the conversation.
 * It handles three types of messages:
 * - User messages (right-aligned, blue background)
 * - Assistant messages (left-aligned, gray background)
 * - Campaign messages (special display with CampaignDisplay component)
 * 
 * Features:
 * - Perplexity-style message bubbles
 * - Different styling for user vs assistant
 * - Special handling for campaign data
 * - Message formatting and icons
 */

import React from 'react';
import { Bot, User } from 'lucide-react';                    // Icons for message types
import CampaignDisplay from './CampaignDisplay';            // Special component for campaign data

const ChatMessage = ({ message }) => {
  // Determine message type for conditional rendering
  const isUser = message.type === 'user';                   // User message (right side)
  const isCampaign = message.type === 'campaign';           // Campaign message (special display)

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
