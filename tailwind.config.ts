import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // GMTM Design System - Extracted from Front Office App
        gmtm: {
          // Sidebar & Dark Elements
          'sidebar': '#1e2433',
          'sidebar-hover': '#2a3142',
          'sidebar-active': '#323b4e',

          // Primary Accent - The signature GMTM lime/chartreuse
          'lime': '#c8e84b',
          'lime-hover': '#b8d83b',
          'lime-muted': '#c8e84b20',

          // Secondary Accent - Purple for metrics/SPARQ
          'purple': '#7c5cff',
          'purple-light': '#7c5cff15',

          // Backgrounds
          'bg': '#ffffff',
          'bg-secondary': '#f8f9fb',
          'bg-tertiary': '#f1f3f5',

          // Text Hierarchy
          'text': '#1a1f2e',
          'text-secondary': '#5a6578',
          'text-muted': '#8b95a5',
          'text-light': '#adb5c2',

          // Borders
          'border': '#e8eaed',
          'border-light': '#f1f3f5',
          'border-dark': '#d1d5db',

          // Status Colors
          'success': '#22c55e',
          'warning': '#f59e0b',
          'error': '#ef4444',
          'info': '#3b82f6',

          // Legacy compatibility
          'teal': '#c8e84b',
          'green': '#c8e84b',
          'primary': '#1e2433',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'sidebar': '2px 0 8px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
