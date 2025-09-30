/**
 * MARKOPOLO AI - BACKEND SERVER
 * =============================
 * 
 * This is the main backend server for the Markopolo AI Campaign Intelligence Platform.
 * It provides REST API endpoints and real-time streaming capabilities using Server-Sent Events (SSE).
 * 
 * Key Features:
 * - Express.js REST API with CORS support
 * - Server-Sent Events for real-time JSON streaming
 * - Session management for multiple users
 * - Mock data sources (Facebook Pixel, Shopify, Google Ads)
 * - AI-powered campaign generation with intelligent channel selection
 * - Real-time campaign streaming with character-by-character output
 */

// Import required dependencies
const express = require('express');           // Web framework for Node.js
const cors = require('cors');                 // Cross-Origin Resource Sharing middleware
const { v4: uuidv4 } = require('uuid');      // UUID generator for unique session IDs
require('dotenv').config();                   // Environment variables loader

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 5001;        // Server port (default: 5001)

// Configure middleware
app.use(cors());                              // Enable CORS for all routes (allows frontend to connect)
app.use(express.json());                      // Parse JSON request bodies

// In-memory storage for demo purposes
// In production, this would be replaced with a database (Redis, MongoDB, etc.)
const sessions = new Map();                    // Store user sessions: sessionId -> { connectedSources: [], selectedChannels: [] }

/**
 * DATA SOURCES CONFIGURATION
 * ===========================
 * 
 * Mock data sources that simulate real integrations with external platforms.
 * Each source contains realistic data that would be available from actual APIs.
 * 
 * In production, these would be replaced with real API integrations:
 * - Facebook Pixel API for user tracking data
 * - Shopify Admin API for e-commerce metrics
 * - Google Ads API for advertising performance data
 */
const DATA_SOURCES = {
  'facebook-pixel': {
    name: 'Facebook Pixel',
    type: 'tracking',
    mockData: {
      activeUsers: 15420,                    // Total active users tracked
      pageViews: 45230,                      // Total page views
      conversionRate: 3.2,                   // Conversion rate percentage
      topPages: ['/products', '/checkout', '/about'],  // Most visited pages
      demographics: { age: '25-34', gender: 'Mixed', location: 'US, UK, CA' }  // User demographics
    }
  },
  'shopify': {
    name: 'Shopify',
    type: 'ecommerce',
    mockData: {
      totalCustomers: 8450,                  // Total customer count
      activeProducts: 234,                   // Number of active products
      averageOrderValue: 85.50,              // Average order value in USD
      topProducts: ['Wireless Earbuds', 'Smart Watch', 'Phone Case'],  // Best-selling products
      recentOrders: 1250,                    // Recent orders count
      customerSegments: {                    // Customer segmentation data
        highValue: 850,                      // High-value customers
        returning: 3200,                     // Returning customers
        new: 4400                           // New customers
      }
    }
  },
  'google-ads': {
    name: 'Google Ads Tag',
    type: 'advertising',
    mockData: {
      impressions: 125000,
      clicks: 4500,
      ctr: 3.6,
      conversions: 180,
      costPerClick: 1.25,
      topKeywords: ['best headphones', 'wireless earbuds', 'smart watch deals'],
      performance: { excellent: 45, good: 35, needsWork: 20 }
    }
  }
};

/**
 * CHANNEL CONFIGURATIONS
 * ======================
 * 
 * Available marketing channels with their characteristics and performance metrics.
 * Each channel has different strengths and use cases for campaign delivery.
 */
const CHANNELS = {
  email: {
    name: 'Email',
    bestFor: ['detailed content', 'newsletters', 'product launches'],  // Best use cases
    avgEngagement: 22.5,                                              // Average engagement rate %
    cost: 'low'                                                        // Cost level: low/medium/high
  },
  sms: {
    name: 'SMS',
    bestFor: ['urgent messages', 'flash sales', 'time-sensitive'],     // Best for urgent communications
    avgEngagement: 45.3,                                              // High engagement rate
    cost: 'medium'                                                    // Medium cost level
  },
  whatsapp: {
    name: 'WhatsApp',
    bestFor: ['personal engagement', 'customer support', 'order updates'],  // Personal communication
    avgEngagement: 38.7,                                                  // High engagement
    cost: 'medium'                                                        // Medium cost
  },
  ads: {
    name: 'Ads',
    bestFor: ['broad reach', 'brand awareness', 'retargeting'],         // Wide reach campaigns
    avgEngagement: 12.8,                                              // Lower engagement but wide reach
    cost: 'high'                                                       // High cost for broad reach
  }
};

/**
 * API ROUTES
 * ==========
 * 
 * REST API endpoints for the Markopolo AI platform.
 * All routes are prefixed with /api for organization.
 */

// Health check endpoint - used to verify server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get available data sources - returns list of all available data sources
app.get('/api/data-sources', (req, res) => {
  // Transform DATA_SOURCES object into array format for frontend
  const sources = Object.keys(DATA_SOURCES).map(key => ({
    id: key,                                    // Unique identifier
    name: DATA_SOURCES[key].name,              // Display name
    type: DATA_SOURCES[key].type               // Source type (tracking, ecommerce, advertising)
  }));
  res.json(sources);
});

// Get available channels - returns list of all marketing channels
app.get('/api/channels', (req, res) => {
  // Transform CHANNELS object into array format for frontend
  const channels = Object.keys(CHANNELS).map(key => ({
    id: key,                                    // Channel identifier
    name: CHANNELS[key].name,                  // Display name
    bestFor: CHANNELS[key].bestFor              // Use cases for this channel
  }));
  res.json(channels);
});

/**
 * Connect to a data source
 * 
 * This endpoint simulates connecting to an external data source.
 * In production, this would authenticate with the actual API and store credentials.
 */
app.post('/api/connect', (req, res) => {
  const { sessionId, source } = req.body;        // Extract session ID and source from request
  
  // Validate that the requested source exists
  if (!DATA_SOURCES[source]) {
    return res.status(400).json({ error: 'Invalid data source' });
  }

  // Create new session if it doesn't exist
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { connectedSources: [], createdAt: Date.now() });
  }

  const session = sessions.get(sessionId);       // Get existing session
  
  // Add source to connected sources if not already connected
  if (!session.connectedSources.includes(source)) {
    session.connectedSources.push(source);
  }

  // Return success response with source data
  res.json({
    success: true,
    source: DATA_SOURCES[source].name,           // Source display name
    mockData: DATA_SOURCES[source].mockData,     // Mock data from source
    connectedSources: session.connectedSources.map(s => DATA_SOURCES[s].name)  // All connected sources
  });
});

// Generate campaign with streaming
app.get('/api/generate-campaign', (req, res) => {
  const sessionId = req.query.sessionId;
  const campaignType = req.query.type || 'general';
  const selectedChannels = req.query.channels ? req.query.channels.split(',') : [];

  if (!sessions.has(sessionId)) {
    return res.status(400).json({ error: 'No session found. Please connect data sources first.' });
  }

  const session = sessions.get(sessionId);
  
  if (session.connectedSources.length === 0) {
    return res.status(400).json({ error: 'No data sources connected' });
  }

  // Set up Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Generate campaign based on connected sources and selected channels
  const campaign = generateCampaign(session.connectedSources, campaignType, selectedChannels);
  
  // Stream the JSON in chunks
  streamJSONResponse(req, res, campaign);
});

/**
 * Generate Campaign Helper Function
 * ================================
 * 
 * This function creates AI-powered campaign recommendations based on:
 * - Connected data sources (Facebook Pixel, Shopify, Google Ads)
 * - Campaign type (general, flash-sale, product-launch)
 * - User-selected channels (Email, SMS, WhatsApp, Ads)
 * 
 * It aggregates data from all sources and uses intelligent algorithms
 * to recommend the optimal channel, timing, message, and audience.
 */
function generateCampaign(connectedSources, campaignType, selectedChannels = []) {
  const campaignId = uuidv4();                              // Generate unique campaign ID
  const timestamp = new Date().toISOString();               // Current timestamp
  
  // Aggregate insights from connected sources
  let totalAudience = 0;                                    // Total audience size across all sources
  let insights = [];                                         // Data-driven insights array
  
  // Process each connected data source to extract insights and audience data
  connectedSources.forEach(source => {
    const data = DATA_SOURCES[source].mockData;              // Get mock data for this source
    
    // Process Facebook Pixel data
    if (source === 'facebook-pixel') {
      totalAudience += data.activeUsers;                     // Add to total audience
      insights.push(`High engagement on ${data.topPages.join(', ')}`);  // Page engagement insight
      insights.push(`Primary demographic: ${data.demographics.age} from ${data.demographics.location}`);  // Demographics
    } 
    // Process Shopify e-commerce data
    else if (source === 'shopify') {
      totalAudience += data.totalCustomers;                 // Add customers to audience
      insights.push(`${data.customerSegments.highValue} high-value customers identified`);  // Customer segments
      insights.push(`Top products: ${data.topProducts.join(', ')}`);  // Product performance
      insights.push(`Average order value: $${data.averageOrderValue}`);  // Revenue insights
    } 
    // Process Google Ads performance data
    else if (source === 'google-ads') {
      insights.push(`Strong performance on keywords: ${data.topKeywords.slice(0, 2).join(', ')}`);  // Keyword performance
      insights.push(`Current CTR: ${data.ctr}% with ${data.conversions} conversions`);  // Ad performance
    }
  });

  // INTELLIGENT CHANNEL SELECTION ALGORITHM
  // ======================================
  // This algorithm selects the optimal channel based on:
  // 1. User's selected channels (if any)
  // 2. Campaign type and requirements
  // 3. Channel performance characteristics
  let selectedChannel = 'email';                              // Default fallback channel
  let channelReasoning = '';                                   // Explanation for channel choice
  
  // If user has selected channels, use intelligent selection from their choices
  if (selectedChannels.length > 0) {
    // Optimize channel selection based on campaign type and user preferences
    if (campaignType === 'flash-sale' || campaignType === 'urgent') {
      // For urgent campaigns, prioritize SMS for immediate delivery
      selectedChannel = selectedChannels.includes('sms') ? 'sms' : selectedChannels[0];
      channelReasoning = `Using your selected channel: ${selectedChannel} (optimized for urgency)`;
    } else if (campaignType === 'product-launch' || campaignType === 'detailed') {
      // For detailed campaigns, prioritize Email for rich content
      selectedChannel = selectedChannels.includes('email') ? 'email' : selectedChannels[0];
      channelReasoning = `Using your selected channel: ${selectedChannel} (optimized for detailed content)`;
    } else if (campaignType === 'retargeting' || campaignType === 'awareness') {
      // For broad reach campaigns, prioritize Ads for maximum visibility
      selectedChannel = selectedChannels.includes('ads') ? 'ads' : selectedChannels[0];
      channelReasoning = `Using your selected channel: ${selectedChannel} (optimized for broad reach)`;
    } else {
      // Use first selected channel for general campaigns
      selectedChannel = selectedChannels[0];
      channelReasoning = `Using your selected channel: ${selectedChannel}`;
    }
  } else {
    // Fallback to intelligent selection if no channels selected
    if (campaignType === 'flash-sale' || campaignType === 'urgent') {
      selectedChannel = 'sms';
      channelReasoning = 'SMS chosen for high urgency and immediate engagement (45.3% avg open rate)';
    } else if (campaignType === 'product-launch' || campaignType === 'detailed') {
      selectedChannel = 'email';
      channelReasoning = 'Email chosen for detailed product information and visual content';
    } else if (campaignType === 'retargeting' || campaignType === 'awareness') {
      selectedChannel = 'ads';
      channelReasoning = 'Ads chosen for broad reach and retargeting capabilities';
    } else if (totalAudience < 5000) {
      selectedChannel = 'whatsapp';
      channelReasoning = 'WhatsApp chosen for personalized engagement with smaller audience';
    } else {
      selectedChannel = 'email';
      channelReasoning = 'Email chosen for cost-effective reach with detailed messaging';
    }
  }

  // Determine optimal time based on insights
  const now = new Date();
  const optimalTime = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000)); // 2 days from now
  optimalTime.setHours(14, 0, 0, 0); // 2 PM optimal time
  
  // Generate message content based on sources
  let messageContent = '';
  let audienceSegment = '';
  let audienceCriteria = [];
  
  if (connectedSources.includes('shopify')) {
    const shopifyData = DATA_SOURCES['shopify'].mockData;
    messageContent = `Exclusive offer for our valued customers! Get 20% off on ${shopifyData.topProducts[0]} and other premium products. Limited time only!`;
    audienceSegment = 'High-value returning customers';
    audienceCriteria = [
      'Purchase history: 2+ orders in last 90 days',
      'Average order value: $50+',
      'Active engagement: Last visit within 14 days',
      'Location: US, UK, CA'
    ];
  } else {
    messageContent = 'Special promotion just for you! Discover amazing deals on our best products.';
    audienceSegment = 'Active engaged users';
    audienceCriteria = [
      'Active in last 30 days',
      'Engaged with product pages',
      'Primary demographic: 25-34 years old'
    ];
  }

  const campaign = {
    campaign: {
      id: campaignId,
      name: `AI-Generated Campaign - ${new Date().toLocaleDateString()}`,
      type: campaignType,
      status: 'draft',
      createdAt: timestamp,
      dataSources: connectedSources.map(s => DATA_SOURCES[s].name),
      estimatedReach: totalAudience,
      goals: [
        'Increase conversion rate by 15-20%',
        'Boost customer engagement',
        'Drive sales within 48 hours'
      ],
      insights: insights
    },
    audience: {
      segment: audienceSegment,
      size: Math.floor(totalAudience * 0.35), // Target 35% of total audience
      criteria: audienceCriteria,
      geography: ['United States', 'United Kingdom', 'Canada'],
      expectedReachRate: '85-90%'
    },
    message: {
      primary: messageContent,
      subject: selectedChannel === 'email' ? '🎉 Exclusive Offer Inside - Limited Time!' : null,
      variations: {
        short: messageContent.substring(0, 80) + '... Shop now!',
        medium: messageContent,
        long: `${messageContent}\n\nWhy shop with us?\n✓ Free shipping on orders over $50\n✓ 30-day money-back guarantee\n✓ 24/7 customer support\n\nDon't miss out on this exclusive opportunity!`
      },
      callToAction: 'Shop Now',
      personalization: {
        enabled: true,
        fields: ['firstName', 'lastPurchase', 'favoriteCategory']
      }
    },
    channel: {
      primary: selectedChannel,
      name: CHANNELS[selectedChannel].name,
      reasoning: channelReasoning,
      fallback: selectedChannel === 'sms' ? 'email' : 'sms',
      estimatedCost: CHANNELS[selectedChannel].cost,
      expectedEngagement: CHANNELS[selectedChannel].avgEngagement + '%'
    },
    timing: {
      optimal: optimalTime.toISOString(),
      timezone: 'America/New_York',
      reasoning: 'Peak engagement window based on historical data (2 PM local time)',
      sendWindow: '2-4 PM local time',
      frequency: 'one-time',
      abTestSchedule: {
        variantA: optimalTime.toISOString(),
        variantB: new Date(optimalTime.getTime() + 3600000).toISOString() // 1 hour later
      }
    },
    metrics: {
      kpis: [
        {
          name: 'Open Rate',
          target: selectedChannel === 'email' ? '25%' : selectedChannel === 'sms' ? '45%' : '35%',
          current: null
        },
        {
          name: 'Click-Through Rate',
          target: '8-12%',
          current: null
        },
        {
          name: 'Conversion Rate',
          target: '4-6%',
          current: null
        },
        {
          name: 'Revenue Generated',
          target: `$${(totalAudience * 0.35 * 0.05 * 85.50).toFixed(2)}`,
          current: null
        }
      ],
      tracking: {
        utmParameters: {
          source: 'markopolo',
          medium: selectedChannel,
          campaign: campaignId
        },
        conversionPixels: connectedSources.includes('facebook-pixel') ? ['Facebook Pixel'] : [],
        analyticsEnabled: true
      }
    },
    budget: {
      estimated: calculateBudget(totalAudience * 0.35, selectedChannel),
      breakdown: {
        creative: '$200',
        distribution: calculateDistributionCost(totalAudience * 0.35, selectedChannel),
        tools: '$50'
      },
      roi_projection: '450-600%'
    },
    execution: {
      readyToExecute: true,
      requiredApprovals: ['Marketing Manager', 'Budget Holder'],
      estimatedSetupTime: '15-30 minutes',
      platforms: getPlatformsForChannel(selectedChannel),
      nextSteps: [
        'Review and approve campaign',
        'Finalize creative assets',
        'Set up tracking parameters',
        'Schedule campaign',
        'Monitor performance dashboard'
      ]
    }
  };

  return campaign;
}

function calculateBudget(audienceSize, channel) {
  const costs = {
    email: 0.01,
    sms: 0.05,
    whatsapp: 0.03,
    ads: 0.50
  };
  return `$${(audienceSize * costs[channel]).toFixed(2)}`;
}

function calculateDistributionCost(audienceSize, channel) {
  const costs = {
    email: 0.01,
    sms: 0.05,
    whatsapp: 0.03,
    ads: 0.50
  };
  return `$${(audienceSize * costs[channel]).toFixed(2)}`;
}

function getPlatformsForChannel(channel) {
  const platforms = {
    email: ['SendGrid', 'Mailchimp', 'AWS SES'],
    sms: ['Twilio', 'MessageBird', 'AWS SNS'],
    whatsapp: ['Twilio WhatsApp API', 'WhatsApp Business API'],
    ads: ['Facebook Ads', 'Google Ads', 'TikTok Ads']
  };
  return platforms[channel] || [];
}

/**
 * Server-Sent Events (SSE) Streaming Function
 * =========================================
 * 
 * This function creates the real-time streaming effect by sending JSON data
 * character by character, simulating AI typing like ChatGPT.
 * 
 * How it works:
 * 1. Converts campaign data to formatted JSON string
 * 2. Sends 50-character chunks every 50ms
 * 3. Creates smooth typing animation effect
 * 4. Handles client disconnection gracefully
 */
function streamJSONResponse(req, res, data) {
  const jsonString = JSON.stringify(data, null, 2);           // Format JSON with 2-space indentation
  let index = 0;                                              // Current position in JSON string
  
  // Create interval to send chunks at regular intervals
  const interval = setInterval(() => {
    if (index < jsonString.length) {
      // Send chunks of 50 characters at a time for smooth streaming
      const chunk = jsonString.slice(index, index + 50);
      res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);  // SSE format
      index += 50;                                            // Move to next chunk
    } else {
      // Send completion signal with full campaign data
      res.write(`data: ${JSON.stringify({ chunk: '', done: true, complete: data })}\n\n`);
      clearInterval(interval);                                 // Stop streaming
      res.end();                                              // Close connection
    }
  }, 50);                                                     // Stream every 50ms for smooth effect

  // Handle client disconnect to prevent memory leaks
  req.on('close', () => {
    clearInterval(interval);                                  // Stop streaming
    res.end();                                                // Close connection
  });
}

/**
 * START SERVER
 * ============
 * 
 * Initialize and start the Express server on the specified port.
 * Uses 'localhost' instead of '0.0.0.0' to avoid Windows permission issues.
 */
app.listen(PORT, 'localhost', () => {
  console.log(`🚀 Markopolo AI Backend running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});
