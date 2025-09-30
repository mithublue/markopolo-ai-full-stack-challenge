/**
 * TAILWIND CSS CONFIGURATION
 * ==========================
 * 
 * This file configures Tailwind CSS for the Markopolo AI frontend.
 * 
 * Key Features:
 * - Custom primary color palette (blue theme)
 * - Content paths for all React components
 * - Custom animations for UI effects
 * - Utility-first CSS approach
 * 
 * Color Palette:
 * - Primary blue theme with 50-900 shades
 * - Consistent with modern UI design
 * - Accessible contrast ratios
 */

/** @type {import('tailwindcss').Config} */
export default {
  // Files to scan for Tailwind classes
  content: [
    "./index.html",                                    // Main HTML file
    "./src/**/*.{js,ts,jsx,tsx}",                      // All React components
  ],
  theme: {
    extend: {
      // Custom color palette for the application
      colors: {
        primary: {
          50: '#f0f9ff',                               // Lightest blue
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',                               // Main primary color
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',                               // Darkest blue
        }
      },
      // Custom animations for UI effects
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',  // Slow pulse for loading states
      }
    },
  },
  plugins: [],                                          // No additional plugins needed
}
