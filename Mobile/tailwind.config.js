/** @type {import('tailwindcss').Config} */
//
// NativeWind 4 + Tailwind 3.
//
// Color tokens reference CSS variables defined in `global.css`. Each
// variable swaps automatically under `@media (prefers-color-scheme: dark)`,
// which NativeWind wires to `useColorScheme()`. The result: a single
// class — e.g. `bg-canvas`, `text-primary`, `border-subtle` — resolves
// to the right value in both schemes. No need to write `dark:` variants
// across the codebase for ordinary colour usage.
//
// Brand and semantic accent colours stay literal — they don't flip
// across schemes.
//
// The light / dark palette here mirrors `Mobile/constants/tokens.ts`,
// so screens that style with `useTheme()` and screens that style with
// `className` end up rendering the same pixels.
//
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        // ── Brand (stable across themes) ────────────────────────────────
        brand: {
          DEFAULT: "#5B3DF5",
          strong: "#3F23D9",
          soft: "#8A75FF",
        },
        accent: {
          DEFAULT: "#22D3EE",
          soft: "#67E8F9",
        },
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",

        // ── Semantic surfaces (auto-flip via CSS variables) ─────────────
        canvas: "var(--color-bg-canvas)",
        elevated: "var(--color-bg-elevated)",
        muted: "var(--color-bg-muted)",
        surface: {
          DEFAULT: "var(--color-surface)",
          secondary: "var(--color-surface-secondary)",
          raised: "var(--color-surface-raised)",
          sunken: "var(--color-surface-sunken)",
        },
        primary: "var(--color-text-primary)",
        secondary: "var(--color-text-secondary)",
        tertiary: "var(--color-text-tertiary)",
        inverse: "var(--color-text-inverse)",

        // ── Mode-aware tint (used when the brand needs to lift on dark) ─
        tint: {
          DEFAULT: "var(--color-tint-primary)",
          strong: "var(--color-tint-primary-strong)",
          soft: "var(--color-tint-primary-soft)",
        },

        // ── Border tokens (translucent so they read on either scheme) ──
        // Bound directly on `borderColor` via Tailwind's color resolver.
      },
      // Border colours need to live under their own key so `border-subtle`
      // and `border-strong` work as `borderColor` utilities.
      borderColor: {
        subtle: "var(--color-border-subtle)",
        strong: "var(--color-border-strong)",
        DEFAULT: "var(--color-border-subtle)",
      },
      // ── Spacing — 4px baseline grid (mirrors tokens.spacing) ─────────
      spacing: {
        xxs: "2px",
        xs: "4px",
        sm: "8px",
        md: "12px",
        base: "16px",
        lg: "20px",
        xl: "24px",
        xxl: "32px",
        xxxl: "40px",
        huge: "56px",
        giant: "72px",
      },
      // ── Type scale (mirrors tokens.typography) ───────────────────────
      fontSize: {
        caption: ["11px", { lineHeight: "14px", letterSpacing: "0.3px" }],
        label: ["13px", { lineHeight: "16px", letterSpacing: "0.2px" }],
        bodySm: ["13px", { lineHeight: "18px" }],
        body: ["15px", { lineHeight: "22px" }],
        bodyLg: ["17px", { lineHeight: "24px" }],
        subtitle: ["18px", { lineHeight: "24px", letterSpacing: "-0.1px" }],
        title: ["22px", { lineHeight: "28px", letterSpacing: "-0.3px" }],
        headline: ["28px", { lineHeight: "34px", letterSpacing: "-0.6px" }],
        display: ["40px", { lineHeight: "46px", letterSpacing: "-1.2px" }],
      },
      // ── Radii (mirrors tokens.radii) ─────────────────────────────────
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        base: "16px",
        lg: "20px",
        xl: "24px",
        xxl: "32px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};
