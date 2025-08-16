// Brand Colors Constants
export const BRAND_COLORS = {
  // Primary Colors
  PRIMARY: "#4527A0", // Deep Purple - creativity, intelligence, trustworthy
  PRIMARY_LIGHT: "#7E57C2", // Soft Lavender - hover state, approachable & uplifting
  PRIMARY_DARK: "#311B92", // Dark Indigo - pressed state, deep stability

  // Secondary & Accents
  SECONDARY: "#1565C0", // Trust Blue - reliable, calm navigation & links
  ACCENT_MINT: "#FF7043", // Warm Orange - energetic highlights, notifications, CTAs
  ACCENT_YELLOW: "#42A5F5", // Sky Blue - fresh, inviting accents

  // Status Colors
  SUCCESS: "#43A047", // Forest Green - positive feedback, growth
  WARNING: "#FFB300", // Amber Yellow - cautious alerts, warm attention
  DANGER: "#E53935", // Soft Red - urgent errors, serious but not alarming

  // Background & Surface
  BACKGROUND: "#FAFAFA", // Soft White-Gray - serene, easy on eyes
  SURFACE: "#FFFFFF", // Pure White - clean content surfaces
  SURFACE_MUTED: "#F5F5F5", // Light Gray - muted elements, subtle depth

  // Borders
  BORDER_LIGHT: "#E0E0E0", // Light Gray - minimal, clean borders
  BORDER_DARK: "#B0BEC5", // Slate Gray - stronger borders, professional

  // Text
  TEXT_PRIMARY: "#424242", // Dark Gray - readable, softer than black
  TEXT_SECONDARY: "#757575", // Medium Gray - secondary text, less emphasis
  PLACEHOLDER: "#B0BEC5", // Slate Gray - placeholders, calm & unobtrusive

  // Icons
  ICON_PRIMARY: "#4527A0", // Deep Purple - brand-aligned icons
  ICON_SECONDARY: "#90A4AE", // Blue-Gray - secondary icons, subtle
} as const;

// Tab-specific gradient configurations using brand colors
export const TAB_GRADIENTS = {
  index: [BRAND_COLORS.PRIMARY, BRAND_COLORS.PRIMARY_LIGHT],
  search: [BRAND_COLORS.ACCENT_YELLOW, BRAND_COLORS.SECONDARY],
  notifications: [BRAND_COLORS.ACCENT_MINT, BRAND_COLORS.PRIMARY],
  messages: [BRAND_COLORS.ACCENT_YELLOW, BRAND_COLORS.ACCENT_MINT],
  profile: [BRAND_COLORS.PRIMARY, BRAND_COLORS.PRIMARY_DARK],
} as const;

// Animation and styling constants
export const TAB_CONFIG = {
  BORDER_RADIUS: 100,
  ICON_SIZE_ACTIVE: 28,
  ICON_SIZE_INACTIVE: 22,
  CONTAINER_HEIGHT: 80,
  ICON_CONTAINER_SIZE: 56,
  SHADOW_ELEVATION: 12,
  BLUR_INTENSITY: 60,
} as const;