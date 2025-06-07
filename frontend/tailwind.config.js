/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        'dark': {
          'bg': '#1C1C1E',           // Very dark gray (main background)
          'secondary': '#2C2C2E',    // Slightly lighter dark gray (for cards, inputs)
          'border': '#3A3A3C',       // Medium gray (for borders and dividers)
          'text': '#FFFFFF',         // White (for main content)
          'text-secondary': '#8E8E93', // Light gray (for placeholders, helper text, inactive states)
          'accent': '#007AFF',       // iOS blue (for active tabs, buttons, links)
          'success': '#007AFF',      // Same blue for toggles and active states
          'destructive': '#FF3B30',  // Red (for remove/delete actions)
          'disabled': '#4A90E2',     // Muted blue (for disabled button states)
        },
        'papaya-whip': {
          '50': '#fff8ed',
          '100': '#ffefd5',
          '200': '#fedbaa',
          '300': '#fdc174',
          '400': '#fb9b3c',
          '500': '#f97e16',
          '600': '#ea630c',
          '700': '#c24a0c',
          '800': '#9a3a12',
          '900': '#7c3212',
          '950': '#431707',
        }, 
        'black': {
          '50': '#f6f6f6',
          '100': '#e7e7e7',
          '200': '#d1d1d1',
          '300': '#b0b0b0',
          '400': '#888888',
          '500': '#6d6d6d',
          '600': '#5d5d5d',
          '700': '#4f4f4f',
          '800': '#454545',
          '900': '#3d3d3d',
          '950': '#000000',
        },
      }
    },
  },
  plugins: [],
}