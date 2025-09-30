/**
 * VITE CONFIGURATION
 * ==================
 * 
 * This file configures the Vite development server for the React frontend.
 * 
 * Key Features:
 * - React plugin for JSX support
 * - Development server on port 3000
 * - API proxy to backend server (port 5001)
 * - Hot module replacement (HMR) for fast development
 * 
 * Proxy Configuration:
 * - All requests to '/api' are forwarded to backend server
 * - Enables CORS-free development
 * - changeOrigin: true for proper header handling
 */

import { defineConfig } from 'vite'                    // Vite configuration function
import react from '@vitejs/plugin-react'              // React plugin for Vite

export default defineConfig({
  plugins: [react()],                                  // Enable React support
  server: {
    port: 3000,                                        // Frontend development server port
    proxy: {
      '/api': {                                        // Proxy all /api requests
        target: 'http://localhost:5001',               // Backend server URL
        changeOrigin: true                             // Change origin header for CORS
      }
    }
  }
})
