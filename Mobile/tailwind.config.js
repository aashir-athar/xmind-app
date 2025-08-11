/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: "#FF6B57", // Warm Optimistic Coral - brand & primary action
        primaryLight: "#FF8A78", // Softer coral for hover states
        primaryDark: "#E85A46", // Slightly deeper coral for pressed states

        secondary: "#FFE8D1", // Soft Honey Beige - calming secondary
        accentMint: "#3AC6A8", // Fresh Mint - success, positive feedback
        accentYellow: "#FFC85C", // Soft Amber Glow - notifications, highlights

        // Semantic status
        success: "#3AC6A8", // Matches accentMint
        warning: "#FFC85C", // Matches accentYellow
        danger: "#E64B46", // Softer than pure red, still noticeable

        // Neutral palette
        background: "#FAFAF7", // Cloud White - off-white, easy on eyes
        surface: "#FFFFFF", // Pure white for cards & content areas
        surfaceMuted: "#F5F6F4", // Very light neutral for muted areas
        borderLight: "#EFEFEA", // Subtle light borders
        borderDark: "#E2E2DD", // Darker neutral border

        // Text
        textPrimary: "#1E1E1E", // Deep Graphite - softer than pure black
        textSecondary: "#6A6A6A", // Muted graphite for less important text

        // Icons & placeholders
        iconPrimary: "#FF6B57", // Matches primary brand color
        iconSecondary: "#7A7A7A", // Neutral mid-gray for secondary icons
        placeholder: "#A0A0A0", // Softer gray for placeholders
      },
    },
  },
  plugins: [],
};
