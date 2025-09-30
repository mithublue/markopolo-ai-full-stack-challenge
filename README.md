# Markopolo AI - Campaign Intelligence Platform

## 📋 Project Overview

**Project Name:** Markopolo AI - Campaign Intelligence Platform

**What this project does:**
An AI-powered marketing campaign intelligence platform that helps businesses create data-driven campaigns by connecting to various data sources and recommending the optimal channel, timing, message, and audience. The platform features a Perplexity-like chat interface that allows users to connect data sources, select marketing channels, and generate intelligent campaign recommendations with real-time streaming JSON output.

## 🛠️ Tech Stack Used

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Lucide React** - Beautiful icon library
- **JavaScript ES6+** - Modern JavaScript features

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Server-Sent Events (SSE)** - Real-time streaming for JSON output
- **CORS** - Cross-origin resource sharing
- **UUID** - Unique identifier generation

### Development Tools
- **Concurrently** - Run multiple commands simultaneously
- **Nodemon** - Auto-restart backend server during development
- **Git** - Version control

## 🎯 Key Features

- **Interactive Chat Interface** - Perplexity-style chat with real-time responses
- **Data Source Integration** - Connect to Facebook Pixel, Shopify, Google Ads Tag
- **Channel Selection** - Choose from Email, SMS, WhatsApp, Ads
- **AI Campaign Generation** - Intelligent campaign recommendations
- **Real-time Streaming** - JSON output streams character-by-character
- **Beautiful UI/UX** - Clean, modern interface with responsive design
- **Session Management** - Persistent user sessions

## 🚀 Complete Setup Instructions

### Prerequisites
Before starting, ensure you have the following installed on your system:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Git** (optional, for version control)
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

### Step 1: Download/Clone the Project

**Option A: If you have the project files already**
- Navigate to your project folder in terminal/command prompt

**Option B: If cloning from Git**
```bash
git clone <repository-url>
cd markopolo-ai-full-stack-challenge-2
```

### Step 2: Install Dependencies

Open your terminal/command prompt in the project root directory and run:

```bash
npm run install-all
```

This command will:
- Install root dependencies (concurrently)
- Install backend dependencies (Express, CORS, etc.)
- Install frontend dependencies (React, Vite, Tailwind, etc.)

**Expected output:** You should see installation progress for all three packages.

### Step 3: Start the Development Servers

Run the following command to start both backend and frontend servers:

```bash
npm run dev
```

**What this does:**
- Starts backend server on `http://localhost:5001`
- Starts frontend server on `http://localhost:3000`
- Both servers run concurrently

**Expected output:**
```
[0] 🚀 Markopolo AI Backend running on http://localhost:5001
[1] ➜  Local:   http://localhost:3000/
```

### Step 4: Open in Browser

1. **Open your web browser** (Chrome, Firefox, Safari, Edge)
2. **Navigate to:** `http://localhost:3000`
3. **You should see:** The Markopolo AI landing page with:
   - Clean, modern interface
   - Left sidebar with data sources and channels
   - Main area with search input and quick action buttons

### Step 5: Test the Application

1. **Connect Data Sources:**
   - Click on "Facebook Pixel", "Shopify", or "Google Ads Tag" in the left sidebar
   - Watch the status indicators update

2. **Select Channels:**
   - Click on "Email", "SMS", "WhatsApp", or "Ads" in the left sidebar
   - Selected channels will turn blue

3. **Generate Campaigns:**
   - Click "Generate Campaign", "Flash Sale", or "Product Launch" buttons located at the top right of the header.
   - Watch the real-time JSON streaming
   - View the beautiful campaign summary

## 🔧 Alternative Setup (Manual)

If the automated setup doesn't work, you can run the servers separately:

### Start Backend Only
```bash
cd backend
npm install
npm run dev
```

### Start Frontend Only (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

## 🐛 Troubleshooting

### Port Already in Use
If you get port errors:
- **Backend (5001):** Change port in `backend/.env` file
- **Frontend (3000):** Change port in `frontend/vite.config.js`

### Dependencies Issues
If installation fails:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Server Not Starting
1. **Check if ports are free:**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   netstat -ano | findstr :5001
   
   # Mac/Linux
   lsof -i :3000
   lsof -i :5001
   ```

2. **Kill processes using ports:**
   ```bash
   # Windows
   taskkill /PID <process_id> /F
   
   # Mac/Linux
   kill -9 <process_id>
   ```

## 📁 Project Structure

```
markopolo-ai-full-stack-challenge-2/
├── backend/                 # Backend API server
│   ├── server.js           # Main Express server
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── utils/         # Helper functions
│   │   ├── App.jsx        # Main app component
│   │   └── index.css      # Global styles
│   ├── index.html         # HTML template
│   ├── vite.config.js     # Vite configuration
│   └── package.json       # Frontend dependencies
├── package.json           # Root package with scripts
├── README.md              # This file
└── .gitignore            # Git ignore rules
```

## 🎯 How to Use the Application

1. **Setup Phase:**
   - Connect at least one data source (Facebook Pixel, Shopify, Google Ads)
   - Select at least one channel (Email, SMS, WhatsApp, Ads)

2. **Generate Campaigns:**
   - Use quick action buttons in header or main area
   - Type natural language in the search box
   - Watch real-time JSON streaming

3. **View Results:**
   - Beautiful campaign summaries with metrics
   - Copy JSON for external integration
   - Expand full JSON for technical details

## 🚀 Production Deployment

For production deployment:

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start production backend:**
   ```bash
   cd backend
   npm start
   ```

3. **Deploy to cloud platforms:**
   - **Frontend:** Vercel, Netlify, or AWS S3
   - **Backend:** Railway, Render, or AWS EC2

## 📞 Support

If you encounter any issues:
1. Check the terminal for error messages
2. Ensure all dependencies are installed
3. Verify ports 3000 and 5001 are available
4. Check Node.js version (18+ required)

---

**Built with ❤️ for Markopolo AI Full Stack Engineer Challenge**