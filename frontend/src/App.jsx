import React, { useState, useEffect, useRef } from 'react';
import { Send, Database, MessageSquare, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import ChatMessage from './components/ChatMessage';
import DataSourceCard from './components/DataSourceCard';
import TypingIndicator from './components/TypingIndicator';
import { generateSessionId } from './utils/helpers';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function App() {
  const [sessionId] = useState(generateSessionId());
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "👋 Hello! I'm your AI Marketing Campaign Assistant. I can help you create data-driven campaigns by connecting to your data sources and selecting your preferred channels.\n\nTo get started:\n1. **Connect data sources** from the sidebar (Facebook Pixel, Shopify, Google Ads)\n2. **Select channels** you want to use (Email, SMS, WhatsApp, Ads)\n3. **Generate campaigns** using the quick action buttons\n\nLet's create some amazing campaigns! 🚀",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectedSources, setConnectedSources] = useState([]);
  const [availableSources, setAvailableSources] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    fetchDataSources();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchDataSources = async () => {
    try {
      console.log('Fetching data sources from:', `${API_BASE}/data-sources`);
      const response = await fetch(`${API_BASE}/data-sources`);
      const data = await response.json();
      console.log('Data sources received:', data);
      setAvailableSources(data);
    } catch (error) {
      console.error('Error fetching data sources:', error);
    }
  };

  const handleConnectSource = async (sourceId) => {
    try {
      const response = await fetch(`${API_BASE}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, source: sourceId })
      });

      const data = await response.json();

      if (data.success) {
        setConnectedSources(prev => [...new Set([...prev, sourceId])]);
        
        const newMessage = {
          id: Date.now(),
          type: 'assistant',
          content: `✅ Successfully connected to **${data.source}**!\n\nConnected sources: ${data.connectedSources.join(', ')}\n\nYou can now generate campaigns or connect more sources for better insights.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.error('Error connecting source:', error);
      const errorMessage = {
        id: Date.now(),
        type: 'assistant',
        content: '❌ Failed to connect to data source. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSelectChannel = (channelId) => {
    setSelectedChannels(prev => {
      if (prev.includes(channelId)) {
        return prev.filter(id => id !== channelId);
      } else {
        return [...prev, channelId];
      }
    });
  };

  const handleGenerateCampaign = async (campaignType = 'general') => {
    if (connectedSources.length === 0) {
      const warningMessage = {
        id: Date.now(),
        type: 'assistant',
        content: '⚠️ Please connect at least one data source before generating a campaign.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, warningMessage]);
      return;
    }

    if (selectedChannels.length === 0) {
      const warningMessage = {
        id: Date.now(),
        type: 'assistant',
        content: '⚠️ Please select at least one channel before generating a campaign.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, warningMessage]);
      return;
    }

    setIsStreaming(true);
    
    const loadingMessage = {
      id: Date.now(),
      type: 'assistant',
      content: '🤖 Analyzing your connected data sources and generating an optimized campaign...',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, loadingMessage]);

    // Create placeholder for streaming message
    const streamMessageId = Date.now() + 1;
    const streamMessage = {
      id: streamMessageId,
      type: 'campaign',
      content: '',
      isStreaming: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, streamMessage]);

    try {
      const eventSource = new EventSource(
        `${API_BASE}/generate-campaign?sessionId=${sessionId}&type=${campaignType}&channels=${selectedChannels.join(',')}`
      );
      eventSourceRef.current = eventSource;

      let accumulatedContent = '';

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.done) {
          eventSource.close();
          setIsStreaming(false);
          
          // Update the message with complete data
          setMessages(prev =>
            prev.map(msg =>
              msg.id === streamMessageId
                ? { ...msg, content: JSON.stringify(data.complete, null, 2), isStreaming: false, completeData: data.complete }
                : msg
            )
          );

          // Add success message
          const successMessage = {
            id: Date.now() + 2,
            type: 'assistant',
            content: '✨ Campaign generated successfully! Review the details above. You can generate another campaign or adjust your data sources for different insights.',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, successMessage]);
        } else {
          accumulatedContent += data.chunk;
          setMessages(prev =>
            prev.map(msg =>
              msg.id === streamMessageId
                ? { ...msg, content: accumulatedContent }
                : msg
            )
          );
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        setIsStreaming(false);
        
        const errorMessage = {
          id: Date.now() + 3,
          type: 'assistant',
          content: '❌ Error generating campaign. Please try again.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      };
    } catch (error) {
      console.error('Error generating campaign:', error);
      setIsStreaming(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading || isStreaming) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Process the message
    setTimeout(() => {
      const lowercaseInput = inputValue.toLowerCase();
      let response;

      if (lowercaseInput.includes('generate') || lowercaseInput.includes('campaign') || lowercaseInput.includes('create')) {
        handleGenerateCampaign('general');
        setIsLoading(false);
        return;
      } else if (lowercaseInput.includes('flash') || lowercaseInput.includes('sale') || lowercaseInput.includes('urgent')) {
        handleGenerateCampaign('flash-sale');
        setIsLoading(false);
        return;
      } else if (lowercaseInput.includes('product launch') || lowercaseInput.includes('new product')) {
        handleGenerateCampaign('product-launch');
        setIsLoading(false);
        return;
      } else if (lowercaseInput.includes('help') || lowercaseInput.includes('what can you do')) {
        response = {
          id: Date.now() + 1,
          type: 'assistant',
          content: `I can help you with:\n\n📊 **Connect Data Sources**: Link your Facebook Pixel, Shopify, or Google Ads\n🎯 **Generate Campaigns**: Create AI-optimized marketing campaigns\n💡 **Get Insights**: Analyze your data for better targeting\n\nTry asking:\n- "Generate a campaign"\n- "Create a flash sale campaign"\n- "Generate a product launch campaign"`,
          timestamp: new Date()
        };
      } else if (lowercaseInput.includes('connect')) {
        response = {
          id: Date.now() + 1,
          type: 'assistant',
          content: 'Please use the data source cards on the left sidebar to connect your sources.',
          timestamp: new Date()
        };
      } else {
        response = {
          id: Date.now() + 1,
          type: 'assistant',
          content: `I understand you said: "${inputValue}"\n\nTo generate a campaign, please ensure you've connected data sources and then say something like "generate campaign" or click the quick action buttons below.`,
          timestamp: new Date()
        };
      }

      setMessages(prev => [...prev, response]);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-6 h-6 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">Markopolo AI</h1>
          </div>
          <p className="text-sm text-gray-600">Campaign Intelligence Platform</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Data Sources
            </h2>
            <div className="space-y-2">
              {availableSources.length === 0 ? (
                <div className="text-sm text-gray-500 p-3">Loading data sources...</div>
              ) : (
                availableSources.map(source => (
                  <DataSourceCard
                    key={source.id}
                    source={source}
                    isConnected={connectedSources.includes(source.id)}
                    onConnect={() => handleConnectSource(source.id)}
                  />
                ))
              )}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Available Channels</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'email', name: 'Email' },
                { id: 'sms', name: 'SMS' },
                { id: 'whatsapp', name: 'WhatsApp' },
                { id: 'ads', name: 'Ads' }
              ].map(channel => (
                <button
                  key={channel.id}
                  onClick={() => handleSelectChannel(channel.id)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg text-center transition-all ${
                    selectedChannels.includes(channel.id)
                      ? 'bg-primary-600 text-white'
                      : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                  }`}
                >
                  {channel.name}
                </button>
              ))}
            </div>
            {selectedChannels.length > 0 && (
              <div className="mt-2 text-xs text-primary-600">
                Selected: {selectedChannels.length}/4 channels
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => handleGenerateCampaign('general')}
                disabled={connectedSources.length === 0 || selectedChannels.length === 0 || isStreaming}
                className="w-full btn-primary text-sm"
              >
                Generate Campaign
              </button>
              <button
                onClick={() => handleGenerateCampaign('flash-sale')}
                disabled={connectedSources.length === 0 || selectedChannels.length === 0 || isStreaming}
                className="w-full btn-secondary text-sm"
              >
                Flash Sale Campaign
              </button>
              <button
                onClick={() => handleGenerateCampaign('product-launch')}
                disabled={connectedSources.length === 0 || selectedChannels.length === 0 || isStreaming}
                className="w-full btn-secondary text-sm"
              >
                Product Launch
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600">
            <p className="font-semibold mb-1">Connected: {connectedSources.length}/3</p>
            <p>Session ID: {sessionId.slice(0, 8)}...</p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-600" />
                AI Campaign Assistant
              </h2>
              <p className="text-sm text-gray-600">
                Right message · Right channel · Right time · Right audience
              </p>
            </div>
            <div className="flex items-center gap-2">
              {connectedSources.length > 0 && (
                <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  {connectedSources.length} source(s) connected
                </div>
              )}
              {selectedChannels.length > 0 && (
                <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  {selectedChannels.length} channel(s) selected
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message... (e.g., 'generate campaign', 'help')"
                disabled={isLoading || isStreaming}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading || isStreaming}
                className="btn-primary px-6 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Connect data sources first, then generate campaigns for AI-powered insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
