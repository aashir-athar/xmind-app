/**
 * Design tokens — 2026 visual language.
 *
 * Token layers:
 *  1. Primitive scale  (raw values: spacing, radii, durations, type sizes)
 *  2. Semantic palette (light & dark — consumed via `useTheme`)
 *  3. Motion + elevation curves
 *
 * Tokens are exported as readonly literals so TypeScript can narrow on usage
 * (e.g. `keyof typeof spacing`) and so values cannot be mutated at runtime.
 */

// ───────────────────────────────────────────────────────────────────────────
// Spacing — 4px baseline grid (8px modular for layout).
// Names map to a unified scale used across padding, margin, gap.
// ───────────────────────────────────────────────────────────────────────────
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 56,
  giant: 72,
} as const;

export type SpacingToken = keyof typeof spacing;

// ───────────────────────────────────────────────────────────────────────────
// Radii — generous, with a dedicated pill scale for 2026 capsule UI.
// ───────────────────────────────────────────────────────────────────────────
export const radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  pill: 999,
} as const;

// ───────────────────────────────────────────────────────────────────────────
// Typography — fluid type scale aligned to a 1.18 ratio.
// We expose sizes + line-heights as paired literals so consumers don't drift.
// ───────────────────────────────────────────────────────────────────────────
export const typography = {
  display: { size: 40, lineHeight: 46, letterSpacing: -1.2, weight: "700" },
  headline: { size: 28, lineHeight: 34, letterSpacing: -0.6, weight: "700" },
  title: { size: 22, lineHeight: 28, letterSpacing: -0.3, weight: "600" },
  subtitle: { size: 18, lineHeight: 24, letterSpacing: -0.1, weight: "600" },
  bodyLg: { size: 17, lineHeight: 24, letterSpacing: 0, weight: "400" },
  body: { size: 15, lineHeight: 22, letterSpacing: 0, weight: "400" },
  bodySm: { size: 13, lineHeight: 18, letterSpacing: 0.1, weight: "400" },
  label: { size: 13, lineHeight: 16, letterSpacing: 0.2, weight: "600" },
  caption: { size: 11, lineHeight: 14, letterSpacing: 0.3, weight: "500" },
} as const;

export type TypographyToken = keyof typeof typography;

// ───────────────────────────────────────────────────────────────────────────
// Motion — calibrated curves for dopamine-positive micro-interactions
// without excess. Spring presets feed Reanimated `withSpring`.
// ───────────────────────────────────────────────────────────────────────────
export const motion = {
  duration: {
    instant: 80,
    fast: 140,
    base: 220,
    slow: 320,
    deliberate: 480,
  },
  spring: {
    /** Crisp tap feedback. */
    snappy: { damping: 18, stiffness: 320, mass: 0.6 },
    /** Default UI movement. */
    gentle: { damping: 22, stiffness: 220, mass: 0.9 },
    /** Bouncy emphasis (rare — use for delight moments only). */
    bouncy: { damping: 12, stiffness: 180, mass: 0.8 },
  },
} as const;

// ───────────────────────────────────────────────────────────────────────────
// Brand palette — mapped from the existing brand identity. We keep brand
// hues stable across themes; only neutrals and surfaces flip.
// ───────────────────────────────────────────────────────────────────────────
const brand = {
  primary: "#5B3DF5",
  primaryStrong: "#3F23D9",
  primarySoft: "#8A75FF",
  accent: "#22D3EE",
  accentSoft: "#67E8F9",
  warning: "#F59E0B",
  danger: "#EF4444",
  success: "#10B981",
} as const;

// ───────────────────────────────────────────────────────────────────────────
// Semantic palettes. Every screen consumes these via `useTheme()`.
// Naming follows a predictable contract:
//   bg.*       — page / surface backgrounds
//   surface.*  — cards, sheets, inline panels
//   text.*     — typographic foreground
//   border.*   — separators
//   tint.*     — interactive emphasis
//   overlay.*  — modal scrims, glass tints
// ───────────────────────────────────────────────────────────────────────────
export interface ColorPalette {
  bg: { canvas: string; elevated: string; muted: string };
  surface: { primary: string; secondary: string; raised: string; sunken: string };
  text: { primary: string; secondary: string; tertiary: string; inverse: string; onTint: string };
  border: { subtle: string; strong: string; focus: string };
  tint: {
    primary: string;
    primaryStrong: string;
    primarySoft: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
  };
  overlay: { scrim: string; glassTint: string; press: string };
  brand: typeof brand;
}

export const lightPalette: ColorPalette = {
  bg: {
    canvas: "#F7F7FB",
    elevated: "#FFFFFF",
    muted: "#EEEEF4",
  },
  surface: {
    primary: "#FFFFFF",
    secondary: "#F3F3F8",
    raised: "#FFFFFF",
    sunken: "#ECECF1",
  },
  text: {
    primary: "#0E0E12",
    secondary: "#48485A",
    tertiary: "#8C8CA1",
    inverse: "#FFFFFF",
    onTint: "#FFFFFF",
  },
  border: {
    subtle: "rgba(15,15,22,0.08)",
    strong: "rgba(15,15,22,0.16)",
    focus: brand.primary,
  },
  tint: {
    primary: brand.primary,
    primaryStrong: brand.primaryStrong,
    primarySoft: brand.primarySoft,
    accent: brand.accent,
    success: brand.success,
    warning: brand.warning,
    danger: brand.danger,
  },
  overlay: {
    scrim: "rgba(10,10,18,0.45)",
    glassTint: "rgba(255,255,255,0.6)",
    press: "rgba(15,15,22,0.06)",
  },
  brand,
};

export const darkPalette: ColorPalette = {
  bg: {
    canvas: "#08080C",
    elevated: "#13131A",
    muted: "#1A1A24",
  },
  surface: {
    primary: "#13131A",
    secondary: "#1A1A24",
    raised: "#1F1F2B",
    sunken: "#0E0E14",
  },
  text: {
    primary: "#F5F5FA",
    secondary: "#B6B6C7",
    tertiary: "#7A7A90",
    inverse: "#0E0E12",
    onTint: "#FFFFFF",
  },
  border: {
    subtle: "rgba(255,255,255,0.08)",
    strong: "rgba(255,255,255,0.18)",
    focus: brand.primarySoft,
  },
  tint: {
    primary: brand.primarySoft,
    primaryStrong: brand.primary,
    primarySoft: brand.primarySoft,
    accent: brand.accentSoft,
    success: brand.success,
    warning: brand.warning,
    danger: brand.danger,
  },
  overlay: {
    scrim: "rgba(0,0,0,0.6)",
    glassTint: "rgba(20,20,28,0.55)",
    press: "rgba(255,255,255,0.06)",
  },
  brand,
};

// ───────────────────────────────────────────────────────────────────────────
// Elevation — Android uses native shadow values, iOS layers shadow + opacity.
// Each level is a presentational hint; renderers translate to platform style.
// ───────────────────────────────────────────────────────────────────────────
export const elevation = {
  none: { shadowOpacity: 0, elevation: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 } },
  sm: { shadowOpacity: 0.08, elevation: 2, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  md: { shadowOpacity: 0.12, elevation: 4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  lg: { shadowOpacity: 0.18, elevation: 8, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } },
} as const;

export type ElevationToken = keyof typeof elevation;
