/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: "#4527A0", // Deep Purple - creativity, intelligence, trustworthy
        primaryLight: "#7E57C2", // Soft Lavender - hover state, approachable & uplifting
        primaryDark: "#311B92", // Dark Indigo - pressed state, deep stability

        secondary: "#1565C0", // Trust Blue - reliable, calm navigation & links
        secondaryLight: "#42A5F5", // Sky Blue - hover state, fresh & inviting
        secondaryDark: "#0D47A1", // Navy Blue - pressed state, professional depth

        accent: "#FF7043", // Warm Orange - energetic highlights, notifications, CTAs

        // Semantic status
        success: "#43A047", // Forest Green - positive feedback, growth
        warning: "#FFB300", // Amber Yellow - cautious alerts, warm attention
        danger: "#E53935", // Soft Red - urgent errors, serious but not alarming

        // Neutral palette
        background: "#FAFAFA", // Soft White-Gray - serene, easy on eyes
        surface: "#FFFFFF", // Pure White - clean content surfaces
        surfaceMuted: "#F5F5F5", // Light Gray - muted elements, subtle depth
        borderLight: "#E0E0E0", // Light Gray - minimal, clean borders
        borderDark: "#B0BEC5", // Slate Gray - stronger borders, professional

        // Text
        textPrimary: "#424242", // Dark Gray - readable, softer than black
        textSecondary: "#757575", // Medium Gray - secondary text, less emphasis

        // Icons & placeholders
        iconPrimary: "#4527A0", // Deep Purple - brand-aligned icons
        iconSecondary: "#90A4AE", // Blue-Gray - secondary icons, subtle
        placeholder: "#B0BEC5", // Slate Gray - placeholders, calm & unobtrusive
      },
      // Responsive spacing scale
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
        'xxxl': '64px',
      },
      // Responsive font sizes
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'md': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        'xxl': ['24px', { lineHeight: '32px' }],
        'xxxl': ['32px', { lineHeight: '40px' }],
      },
      // Responsive border radius
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        'xxl': '24px',
        'xxxl': '32px',
      },
      // Responsive icon sizes
      width: {
        'icon-xs': '12px',
        'icon-sm': '16px',
        'icon-md': '20px',
        'icon-lg': '24px',
        'icon-xl': '32px',
        'icon-xxl': '48px',
      },
      height: {
        'icon-xs': '12px',
        'icon-sm': '16px',
        'icon-md': '20px',
        'icon-lg': '24px',
        'icon-xl': '32px',
        'icon-xxl': '48px',
      },
    },
  },
  plugins: [],
};
