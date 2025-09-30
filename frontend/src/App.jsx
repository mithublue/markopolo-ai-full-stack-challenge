import React, { useState, useEffect, useRef } from 'react';
import { Send, Database, MessageSquare, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import ChatMessage from './components/ChatMessage';
import DataSourceCard from './components/DataSourceCard';
import TypingIndicator from './components/TypingIndicator';
import { generateSessionId } from './utils/helpers';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function App() {
  const [sessionId] = useState(generateSessionId());
  const [messages, setMessages] = useState([]);
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
    <div className="flex h-screen bg-white">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-6 h-6 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">markopolo</h1>
          </div>
          <p className="text-sm text-gray-600">AI Campaign Intelligence</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Data Sources */}
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
                  <button
                    key={source.id}
                    onClick={() => handleConnectSource(source.id)}
                    disabled={connectedSources.includes(source.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      connectedSources.includes(source.id)
                        ? 'bg-green-50 border-green-500'
                        : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                    } ${connectedSources.includes(source.id) ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900">{source.name}</span>
                      {connectedSources.includes(source.id) ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                      )}
                    </div>
                    <span className="text-xs text-gray-600 capitalize">{source.type}</span>
                    {connectedSources.includes(source.id) && (
                      <div className="mt-2 text-xs text-green-700 font-medium">
                        ✓ Connected
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Channels */}
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

          {/* Status */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 space-y-1">
              <p className="font-semibold">Status:</p>
              <p>Sources: {connectedSources.length}/3</p>
              <p>Channels: {selectedChannels.length}/4</p>
              <p className="text-xs text-gray-500 mt-2">Session: {sessionId.slice(0, 8)}...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
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
            <div className="flex items-center gap-4">
              {/* Quick Action Buttons - Always Visible */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleGenerateCampaign('general')}
                  disabled={connectedSources.length === 0 || selectedChannels.length === 0 || isStreaming}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate Campaign
                </button>
                <button
                  onClick={() => handleGenerateCampaign('flash-sale')}
                  disabled={connectedSources.length === 0 || selectedChannels.length === 0 || isStreaming}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Flash Sale
                </button>
                <button
                  onClick={() => handleGenerateCampaign('product-launch')}
                  disabled={connectedSources.length === 0 || selectedChannels.length === 0 || isStreaming}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Product Launch
                </button>
              </div>
              
              {/* Status Indicators */}
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
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            /* Landing Page - Perplexity Style */
            <div className="max-w-4xl mx-auto px-6 py-16">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">markopolo</h1>
                <p className="text-lg text-gray-600 mb-12">AI-powered marketing campaign intelligence</p>
                
                {/* Main Search Input - Perplexity Style */}
                <div className="relative max-w-2xl mx-auto mb-8">
                  <form onSubmit={handleSendMessage} className="relative">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask anything about your marketing campaigns..."
                      disabled={isLoading || isStreaming}
                      className="w-full px-6 py-4 text-lg border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm"
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isLoading || isStreaming}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>

                {/* Quick Action Pills - Perplexity Style */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                  <button
                    onClick={() => handleGenerateCampaign('general')}
                    disabled={connectedSources.length === 0 || selectedChannels.length === 0 || isStreaming}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Campaign
                  </button>
                  <button
                    onClick={() => handleGenerateCampaign('flash-sale')}
                    disabled={connectedSources.length === 0 || selectedChannels.length === 0 || isStreaming}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Flash Sale
                  </button>
                  <button
                    onClick={() => handleGenerateCampaign('product-launch')}
                    disabled={connectedSources.length === 0 || selectedChannels.length === 0 || isStreaming}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Product Launch
                  </button>
                </div>

                {/* Setup Instructions */}
                <div className="max-w-2xl mx-auto">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Get Started</h3>
                    <div className="text-left space-y-3">
                      <p className="text-sm text-gray-600">
                        1. <strong>Connect data sources</strong> from the left sidebar (Facebook Pixel, Shopify, Google Ads)
                      </p>
                      <p className="text-sm text-gray-600">
                        2. <strong>Select channels</strong> you want to use (Email, SMS, WhatsApp, Ads)
                      </p>
                      <p className="text-sm text-gray-600">
                        3. <strong>Generate campaigns</strong> using the buttons above or type in the search box
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Interface */
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="space-y-6">
                {messages.map(message => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        {messages.length > 0 && (
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask anything about your marketing campaigns..."
                  disabled={isLoading || isStreaming}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading || isStreaming}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
