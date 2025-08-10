/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: "#FF5A5F", // Coral Red - brand & primary action
        primaryLight: "#FF7A73", // hover / soft
        primaryDark: "#E64D4F", // pressed

        secondary: "#FFD6C2", // Warm Peach
        accentMint: "#3ECF8E", // Success
        accentYellow: "#FFC857", // Warnings / highlights

        // Semantic status
        success: "#3ECF8E",
        warning: "#FFC857",
        danger: "#E63946",

        // Neutral palette
        background: "#FAFAFA",
        surface: "#FFFFFF",
        surfaceMuted: "#F8FAFC", // used for very light surfaces / pressed states (gray-50)
        borderLight: "#F0F0F0",
        borderDark: "#E1E8ED", // previously used borderTopColor

        // Text
        textPrimary: "#1A1A1A",
        textSecondary: "#8A8A8A",

        // Icons & placeholders
        iconPrimary: "#FF5F5A",
        iconSecondary: "#657786", // replacement for older #657786 used in icons / placeholder
        placeholder: "#657786",
      },
    },
  },
  plugins: [],
};
