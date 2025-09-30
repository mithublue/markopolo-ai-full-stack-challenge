const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for demo purposes
const sessions = new Map();

// Data source configurations
const DATA_SOURCES = {
  'facebook-pixel': {
    name: 'Facebook Pixel',
    type: 'tracking',
    mockData: {
      activeUsers: 15420,
      pageViews: 45230,
      conversionRate: 3.2,
      topPages: ['/products', '/checkout', '/about'],
      demographics: { age: '25-34', gender: 'Mixed', location: 'US, UK, CA' }
    }
  },
  'shopify': {
    name: 'Shopify',
    type: 'ecommerce',
    mockData: {
      totalCustomers: 8450,
      activeProducts: 234,
      averageOrderValue: 85.50,
      topProducts: ['Wireless Earbuds', 'Smart Watch', 'Phone Case'],
      recentOrders: 1250,
      customerSegments: {
        highValue: 850,
        returning: 3200,
        new: 4400
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

// Channel configurations
const CHANNELS = {
  email: {
    name: 'Email',
    bestFor: ['detailed content', 'newsletters', 'product launches'],
    avgEngagement: 22.5,
    cost: 'low'
  },
  sms: {
    name: 'SMS',
    bestFor: ['urgent messages', 'flash sales', 'time-sensitive'],
    avgEngagement: 45.3,
    cost: 'medium'
  },
  whatsapp: {
    name: 'WhatsApp',
    bestFor: ['personal engagement', 'customer support', 'order updates'],
    avgEngagement: 38.7,
    cost: 'medium'
  },
  ads: {
    name: 'Ads',
    bestFor: ['broad reach', 'brand awareness', 'retargeting'],
    avgEngagement: 12.8,
    cost: 'high'
  }
};

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get available data sources
app.get('/api/data-sources', (req, res) => {
  const sources = Object.keys(DATA_SOURCES).map(key => ({
    id: key,
    name: DATA_SOURCES[key].name,
    type: DATA_SOURCES[key].type
  }));
  res.json(sources);
});

// Get available channels
app.get('/api/channels', (req, res) => {
  const channels = Object.keys(CHANNELS).map(key => ({
    id: key,
    name: CHANNELS[key].name,
    bestFor: CHANNELS[key].bestFor
  }));
  res.json(channels);
});

// Connect to a data source
app.post('/api/connect', (req, res) => {
  const { sessionId, source } = req.body;
  
  if (!DATA_SOURCES[source]) {
    return res.status(400).json({ error: 'Invalid data source' });
  }

  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { connectedSources: [], createdAt: Date.now() });
  }

  const session = sessions.get(sessionId);
  
  if (!session.connectedSources.includes(source)) {
    session.connectedSources.push(source);
  }

  res.json({
    success: true,
    source: DATA_SOURCES[source].name,
    mockData: DATA_SOURCES[source].mockData,
    connectedSources: session.connectedSources.map(s => DATA_SOURCES[s].name)
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

// Helper function to generate campaign
function generateCampaign(connectedSources, campaignType, selectedChannels = []) {
  const campaignId = uuidv4();
  const timestamp = new Date().toISOString();
  
  // Aggregate insights from connected sources
  let totalAudience = 0;
  let insights = [];
  
  connectedSources.forEach(source => {
    const data = DATA_SOURCES[source].mockData;
    if (source === 'facebook-pixel') {
      totalAudience += data.activeUsers;
      insights.push(`High engagement on ${data.topPages.join(', ')}`);
      insights.push(`Primary demographic: ${data.demographics.age} from ${data.demographics.location}`);
    } else if (source === 'shopify') {
      totalAudience += data.totalCustomers;
      insights.push(`${data.customerSegments.highValue} high-value customers identified`);
      insights.push(`Top products: ${data.topProducts.join(', ')}`);
      insights.push(`Average order value: $${data.averageOrderValue}`);
    } else if (source === 'google-ads') {
      insights.push(`Strong performance on keywords: ${data.topKeywords.slice(0, 2).join(', ')}`);
      insights.push(`Current CTR: ${data.ctr}% with ${data.conversions} conversions`);
    }
  });

  // Intelligent channel selection based on campaign type, data, and user selection
  let selectedChannel = 'email'; // default
  let channelReasoning = '';
  
  // If user has selected channels, use them; otherwise use intelligent selection
  if (selectedChannels.length > 0) {
    // Use user's selected channels - pick the best one based on campaign type
    if (campaignType === 'flash-sale' || campaignType === 'urgent') {
      selectedChannel = selectedChannels.includes('sms') ? 'sms' : selectedChannels[0];
      channelReasoning = `Using your selected channel: ${selectedChannel} (optimized for urgency)`;
    } else if (campaignType === 'product-launch' || campaignType === 'detailed') {
      selectedChannel = selectedChannels.includes('email') ? 'email' : selectedChannels[0];
      channelReasoning = `Using your selected channel: ${selectedChannel} (optimized for detailed content)`;
    } else if (campaignType === 'retargeting' || campaignType === 'awareness') {
      selectedChannel = selectedChannels.includes('ads') ? 'ads' : selectedChannels[0];
      channelReasoning = `Using your selected channel: ${selectedChannel} (optimized for broad reach)`;
    } else {
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

function streamJSONResponse(req, res, data) {
  const jsonString = JSON.stringify(data, null, 2);
  let index = 0;
  
  const interval = setInterval(() => {
    if (index < jsonString.length) {
      // Send chunks of 50 characters at a time
      const chunk = jsonString.slice(index, index + 50);
      res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
      index += 50;
    } else {
      // Send completion signal
      res.write(`data: ${JSON.stringify({ chunk: '', done: true, complete: data })}\n\n`);
      clearInterval(interval);
      res.end();
    }
  }, 50); // Stream every 50ms for smooth effect

  // Handle client disconnect
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
}

// Start server
app.listen(PORT, 'localhost', () => {
  console.log(`🚀 Markopolo AI Backend running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});
