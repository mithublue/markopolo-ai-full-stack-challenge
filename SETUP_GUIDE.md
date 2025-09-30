# Quick Setup Guide

## Step 1: Install Dependencies
```bash
npm run install-all
```

## Step 2: Start Development Servers
```bash
npm run dev
```

This will start:
- Backend on http://localhost:5000
- Frontend on http://localhost:3000

## Step 3: Open Your Browser
Navigate to: http://localhost:3000

## How to Use the Application

### 1. Connect Data Sources
- Look at the left sidebar
- Click on any of the three data sources:
  - Facebook Pixel
  - Shopify
  - Google Ads Tag
- Click "Connect" on each card

### 2. Generate Campaigns
After connecting at least one data source, you have three options:

**Option A: Use Quick Action Buttons**
- "Generate Campaign" - Creates a general marketing campaign
- "Flash Sale Campaign" - Creates an urgent, time-sensitive campaign
- "Product Launch" - Creates a detailed product announcement campaign

**Option B: Type in Chat**
Type messages like:
- "generate campaign"
- "create a flash sale campaign"
- "help"

**Option C: Chat Naturally**
Ask questions or make requests in natural language

### 3. View Campaign Results
- Watch the JSON stream in real-time (character by character)
- See a beautiful formatted campaign summary with:
  - Target audience details
  - Recommended channel (Email, SMS, WhatsApp, or Ads)
  - Optimized message content
  - Best timing for sending
  - Budget estimates and ROI projections
  - Key performance indicators (KPIs)
  - Next steps for execution

### 4. Copy Campaign JSON
- Click the copy button in the campaign header
- Use the JSON for integration with external systems

## Troubleshooting

### Ports Already in Use
If port 5000 or 3000 is already in use:

**Backend:** Edit `backend/.env` and change PORT
**Frontend:** Edit `frontend/vite.config.js` and change server.port

### Servers Not Starting
1. Stop all servers: Press Ctrl+C in the terminal
2. Kill any lingering node processes:
   ```bash
   # Windows PowerShell
   Get-Process node | Stop-Process -Force
   ```
3. Restart: `npm run dev`

### Missing Dependencies
Run install again:
```bash
cd backend && npm install
cd ../frontend && npm install
```

## Architecture Overview

### Backend (Port 5000)
- Express.js REST API
- Server-Sent Events for streaming
- Mock data for data sources
- Intelligent campaign generation algorithm

### Frontend (Port 3000)
- React 18 with Vite
- Tailwind CSS for styling
- Real-time streaming display
- Beautiful campaign visualization

## Features Demonstrated

✅ Full-stack development (React + Node.js)
✅ Real-time streaming (SSE)
✅ Modern UI/UX (Perplexity-inspired)
✅ Data source integration (simulated)
✅ Intelligent AI-like decision making
✅ Multi-channel marketing (Email, SMS, WhatsApp, Ads)
✅ Structured JSON output for API integration
✅ Session management
✅ Responsive design

## Next Steps for Production

1. Replace mock data with real API integrations
2. Add authentication (OAuth2)
3. Implement database (PostgreSQL + Redis)
4. Add real AI/ML models (OpenAI, Anthropic)
5. Create campaign execution APIs
6. Add analytics dashboard
7. Implement rate limiting
8. Add comprehensive testing
9. Set up CI/CD pipeline
10. Deploy to cloud (AWS/GCP/Azure)

## Testing the API Directly

### Health Check
```bash
curl http://localhost:5000/api/health
```

### List Data Sources
```bash
curl http://localhost:5000/api/data-sources
```

### Connect to Source
```bash
curl -X POST http://localhost:5000/api/connect \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-123","source":"shopify"}'
```

### Generate Campaign (SSE Stream)
Open in browser:
```
http://localhost:5000/api/generate-campaign?sessionId=test-123&type=general
```

## File Structure
```
├── backend/
│   ├── server.js          # Main API server
│   ├── package.json
│   └── .env              # Environment config
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── utils/        # Helper functions
│   │   ├── App.jsx       # Main app
│   │   └── index.css     # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json          # Root package
└── README.md            # Full documentation
```

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure ports 3000 and 5000 are available
4. Review the README.md for detailed information

---

Built for Markopolo AI Full Stack Engineer Challenge
