# xMind

A calm, premium social app — an X / Twitter-style client built on Expo
React Native with a focused 2026 design language.

> A quieter place to think out loud.

```
[ Mobile (Expo SDK 55) ]  ←→  [ Backend (Node + MongoDB) ]
       Clerk auth                    REST + Cloudinary
       React Query
       Reanimated
       NativeWind
```

---

## Table of contents

1. [What this app is](#what-this-app-is)
2. [Design philosophy](#design-philosophy)
3. [Architecture](#architecture)
4. [Tech stack](#tech-stack)
5. [Project layout](#project-layout)
6. [Design system](#design-system)
7. [Platform-aware patterns (iOS / Android)](#platform-aware-patterns-ios--android)
8. [Performance budget](#performance-budget)
9. [Accessibility](#accessibility)
10. [Voice and copy](#voice-and-copy)
11. [Running locally](#running-locally)
12. [Common scripts](#common-scripts)
13. [Environment variables](#environment-variables)
14. [Production builds](#production-builds)
15. [Backend](#backend)
16. [License](#license)

---

## What this app is

xMind is a complete social-feed app: authentication, a ranked feed,
post creation with images, hashtags, search, threaded comments,
notifications, profiles with verification, and a 1-on-1 messaging UI.

It is built as a **portfolio-grade reference implementation**:

- Senior-level React Native (Expo) patterns end-to-end.
- Strict TypeScript across the entire codebase, with named domain types.
- A design system that scales, with platform-aware materials (Liquid
  Glass on iOS 26+, BlurView on iOS < 26, flat themed surfaces on Android).
- Performance tuned for low-end Android (2 GB RAM devices) — virtualized
  lists, single-shared-value animations, no `setInterval` shimmers,
  zero per-frame style allocations in scroll paths.

---

## Design philosophy

The 2026 brief was the operating constraint:

| Pillar | Decision |
|---|---|
| **Restraint with signature** | Generous whitespace, large readable type, one primary CTA per screen. Decoration is removed unless it carries information. |
| **Material discipline** | A single `Surface` primitive owns all translucent material; BlurView is forbidden on Android by policy. |
| **Pill TabBar** | Capsule bar floating over content; sliding pill indicator drawn entirely on the UI thread. |
| **Theme = OS** | `useColorScheme()` flips light → dark in real time. No theme toggle in the UI; we respect the user's device-level preference. |
| **Psychology, applied** | Progressive disclosure on the composer. Empty states name the next action. Hick's Law in tab labels and search results. |
| **Ethics, not dark patterns** | No fake countdowns, no engagement traps. Loss-aversion language only when the loss is real. |
| **No emojis** | Anywhere — UI strings, code comments, errors. Words are clearer. |

Reference: the rules above match the "2026 fusion" guidance in the
internal *web-app-uiux-psychology-copywriting-2026* brief.

---

## Architecture

```
Mobile/
├─ app/                           Expo Router (file-based)
│  ├─ _layout.tsx                 Provider stack: Gesture → SafeArea → Clerk → Query
│  ├─ (auth)/                     Welcome + sign-in (auth-only)
│  └─ (tabs)/                     Home, Search, Inbox, Messages, Profile
│
├─ components/
│  ├─ ui/                         Design-system primitives (themed, memoised)
│  │   Surface, Text, Button, IconButton, Avatar, Card,
│  │   TextField, Skeleton, EmptyState, ScreenHeader
│  ├─ PillTabBar.tsx              2026 capsule tab bar (animated pill indicator)
│  ├─ PostCard / PostsList /…     Feature-level components (memoised)
│  └─ …Modal.tsx                  Cross-platform modal surfaces
│
├─ constants/
│  ├─ tokens.ts                   Spacing, radii, type, motion, palettes
│  └─ colors.ts                   Legacy `BRAND_COLORS` shim (mirrors the new tokens)
│
├─ hooks/
│  ├─ useTheme.ts                 Resolves the active palette from useColorScheme()
│  └─ use*.ts                     Domain hooks: posts, profile, comments, search, …
│
├─ utils/
│  └─ feedRanking.ts              Multi-factor feed ranking
│
└─ types/index.ts                 Public domain types
```

### Provider stack

Order matters and is enforced in `app/_layout.tsx`:

```
GestureHandlerRootView
  → SafeAreaProvider
    → ClerkProvider
      → QueryClientProvider
        → ThemedStack (StatusBar follows useColorScheme)
```

Gesture handler must wrap everything for swipe-back navigation. React
Query defaults are deliberately conservative: `staleTime: 30s`,
`refetchOnWindowFocus: false`. Mobile screens shouldn't refetch the
moment the user blinks.

---

## Tech stack

| Concern | Choice | Reason |
|---|---|---|
| **Runtime** | Expo SDK 55, React Native 0.83 | Liquid Glass APIs, new arch by default |
| **Router** | Expo Router (file-based) | Conventional, type-safe, deep-linkable |
| **Auth** | Clerk + `@clerk/clerk-expo` | OAuth, secure token cache, passwordless |
| **Server state** | TanStack Query 5 | Cache control, mutations, optimistic UI |
| **Forms / state** | Local `useState` + custom hooks | No global store needed for this scope |
| **Animation** | Reanimated 4 (worklets) | UI-thread driven, 60 fps under scroll |
| **Lists** | `@shopify/flash-list` v2 | Cell recycling, low memory, fast on 2 GB devices |
| **Styling** | NativeWind 4 + theme tokens | Tailwind ergonomics + runtime theme |
| **Glass material** | `expo-glass-effect` (iOS 26+) + `expo-blur` (iOS < 26) | Native Liquid Glass with safe fallback |
| **Haptics** | `expo-haptics` | Subtle confirmation on tap targets |
| **Lang** | TypeScript strict mode | No `any` allowed in domain code |

---

## Project layout

The mobile project is colocated under `Mobile/`. The backend (Node +
Express + MongoDB) lives under `Backend/`. Each is independently
runnable; they communicate over HTTP.

---

## Design system

All design tokens live in [`Mobile/constants/tokens.ts`](Mobile/constants/tokens.ts).

### Layers

1. **Primitive scale** — spacing, radii, motion, typography sizes.
2. **Semantic palettes** — `lightPalette` and `darkPalette` exported as
   `ColorPalette`. Both share the brand hues; only neutrals and
   surfaces flip.
3. **Theme contract** — `useTheme()` returns
   `{ mode, colors, spacing, radii, typography, motion, elevation, statusBarStyle }`.

### Tailwind alignment

[`tailwind.config.js`](Mobile/tailwind.config.js) mirrors the same
tokens so NativeWind classes (`bg-bg-canvas`, `text-text-primary`,
`rounded-pill`, `dark:bg-bg-dk-canvas`) and the runtime hook stay in
sync. `darkMode: 'media'` makes NativeWind react to OS preference
without a manual class toggle.

### Primitives

Every primitive is themed, memoised, and accessible by default.

| Primitive | Purpose |
|---|---|
| `Surface` | Cross-platform translucent / solid container. Owns the iOS-26 / iOS / Android material decision in one place. |
| `Text` | Type-scale tokens + semantic colour roles. |
| `Button` | Capsule, three variants, haptic, hit-slop ≥ 8px, ≥ 48px tap target. |
| `IconButton` | Round button for headers and inline actions. |
| `Avatar` | Image with deterministic initials fallback. |
| `Card` | Presentational wrapper around `Surface`. |
| `TextField` | Themed input with focus ring + error/helper slots. |
| `Skeleton` | Single-driver Reanimated pulse. No `setInterval`. |
| `EmptyState` | Consistent empty UX across feed, search, inbox. |
| `ScreenHeader` | Unified header with floating-glass option. |

---

## Platform-aware patterns (iOS / Android)

### Materials

The `Surface` primitive is the single source of truth.

```
variant="glass":
  ├─ iOS 26+      → expo-glass-effect <GlassView>
  ├─ iOS < 26     → expo-blur <BlurView>
  └─ Android      → flat themed surface (NEVER BlurView)
```

**Why no BlurView on Android.** Android's BlurView implementation in
SDK 55 is software-composited on most low-end GPUs and tanks scroll
FPS. The Surface primitive substitutes a tinted flat surface tuned to
look intentional rather than missing.

### Tab bar

[`PillTabBar`](Mobile/components/PillTabBar.tsx) is a capsule bar
with a single animated pill indicator. The indicator's `translateX`
is derived from one shared value, so taps mutate one signal — no
JS-bridge crossings during the spring.

### Status bar

`StatusBar` lives in `app/_layout.tsx` and is bound to
`useTheme().statusBarStyle`. Light/dark icon contrast follows the OS
on first paint, no flashes.

### Safe areas

Every screen consumes `useSafeAreaInsets()` from
`react-native-safe-area-context`. We don't use the legacy
`react-native` SafeAreaView. This is uniform across iOS notch / Dynamic
Island and Android gesture-nav devices.

### Keyboard

`KeyboardAvoidingView` is wired with `behavior="padding"` on iOS and
`"height"` on Android — the only combination we found that keeps the
composer docked above the keyboard on every test device.

---

## Performance budget

This codebase is tuned for **60 fps on 2 GB Android devices**. The
budget is not aspirational; it's enforced by the choices below.

### Lists

- Every list is `FlashList` with `removeClippedSubviews`.
- `keyExtractor` and `renderItem` are stable via `useCallback`.
- Cells are `React.memo`'d with explicit equality on the small set of
  fields that actually change (likes count, comments count, image, etc.).

### Animations

- All animations run on the UI thread via Reanimated shared values.
- No `setInterval`-driven shimmers — the original `NoNotificationsFound`
  and `ChatCard` pulses were rewritten on `withRepeat` so they stop
  cleanly on unmount and don't allocate JS work per frame.
- Per-cell entrance animations were removed from feed cells. They
  flicker on FlashList recycling and add ~2.5 s of staggered motion
  every time the feed remounts.

### Renders

- `useCallback` wraps every list-row handler so memo'd children stay
  identity-stable.
- `useDeferredValue` defers heavy filters in search / messages so each
  keystroke is paint-fast.
- React Query defaults are conservative; the app does not refetch on
  focus.

### Bundle

- A single legacy `BRAND_COLORS` shim retained for backwards-compat is
  ~2 KB and re-exports tokens, not duplicate values.
- Tab bar components from the previous SDK iteration
  (`CustomTabBar`, `AnimatedTabContainer`, `TabBackground`, `TabIcon`)
  were removed.

---

## Accessibility

- Every interactive element has `accessibilityRole` and
  `accessibilityLabel`.
- Tap targets are ≥ 44 × 44 (WCAG 2.5.5) by construction in `Button`,
  `IconButton`, and the tab bar.
- Type honours OS scaling (`allowFontScaling`).
- Focus state in `TextField` uses a coloured ring, not a colour-only cue.
- Light / dark themes meet WCAG 2.2 AA contrast on text and surfaces.

---

## Voice and copy

Every visible string in xMind goes through one editorial filter. The voice
is part of the product, not decoration after the fact.

### Brand voice

| Attribute | Example |
|---|---|
| **Calm** | "It's quiet in here." (instead of "No notifications.") |
| **Sharp** | "Say something true." (instead of "What's on your mind?") |
| **Specific** | "Inbox zero." (instead of "No conversations yet.") |
| **Honest about loss** | "It'll be gone from your feed and from anyone who's already seen it." |

### Word list

| Use | Avoid |
|---|---|
| think, say, post, true, quietly, slowly | amazing, instantly, unleash, unlock, discover, epic, boom |
| your feed, your inbox, a thought, a reply | content, engagement, users, awesome experience |

### Patterns we apply

- **BAB** (Before / After / Bridge) on the welcome screen — "Slow social,
  on purpose. Say what you actually think — and find the people who
  think too." → CTA "Get started".
- **FAB** (Feature / Advantage / Benefit) on sign-in — "One tap. No
  passwords. We only keep what we need."
- **Goal-Gradient Effect** on verification — phrasing sharpens as the
  user gets closer ("Almost there — 2 steps left").
- **Hick's Law** in tab labels — five icons, full label only on the
  active tab.
- **Progressive disclosure** in the composer — placeholder + 40 px when
  idle, expands to icon row + counter + Post button on focus.
- **Empty states name the next action** —
  *"It's quiet in here. Reactions, replies, and follows land here.
  Posting is the fastest way to start one."*

### Patterns we refuse

- **Fake urgency or scarcity** — no "10 people are looking at this."
- **Confirm-shaming** — destructive dialogs name the cost truthfully
  ("It'll be gone…") instead of guilting the user out of the action.
- **Vague errors** — "Couldn't post" is paired with what's safe ("Your
  draft is still here") and a next step.
- **Brag adjectives** — "amazing," "instantly," "epic" don't ship.
- **Emojis** — anywhere. Words are clearer.

---

## Running locally

### Prerequisites

- Node.js 18+
- npm 10+
- Expo CLI (auto-fetched via `npx`)
- Xcode 16+ for iOS (Liquid Glass requires iOS 26 SDK)
- Android Studio + an Android 14+ emulator or device

### Install

```bash
git clone <repo-url>
cd "X Clone App/Mobile"
npm install --legacy-peer-deps
```

The `--legacy-peer-deps` flag is currently required because
`react-native@0.83.6` declares an optional peer on `@types/react@^19.1.1`
that conflicts with the 19.2.x range pulled by other packages. It is
benign — npm resolves to 19.2 either way.

### Start

```bash
npm run start             # Metro + Expo Dev Tools
# or
npm run ios               # iOS simulator
npm run android           # Android emulator
npm run web               # Web (limited; native-only features won't work)
```

### Validate

```bash
npx expo-doctor           # 18/18 checks passing on a clean install
npx tsc --noEmit          # zero errors in strict mode
```

---

## Common scripts

| Command | What it does |
|---|---|
| `npm run start` | Boot Metro + dev tools |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm run web` | Run web target |
| `npm run lint` | Expo's lint preset |
| `npm run reset-project` | Reset to template starter (destructive) |

---

## Environment variables

The mobile app reads two public Expo env vars:

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_…
EXPO_PUBLIC_API_BASE_URL=https://your-api.example.com/api
```

Place them in `Mobile/.env`. Both must be prefixed with
`EXPO_PUBLIC_` to be available at runtime.

If you don't set `EXPO_PUBLIC_API_BASE_URL`, the app falls back to a
deployed backend at
`https://x-clone-react-native-seven.vercel.app/api` (see
[`Mobile/utils/api.ts`](Mobile/utils/api.ts)). For local backend
development, set the variable to your machine's LAN IP — `localhost`
will not resolve from a physical device.

---

## Production builds

This project uses Expo prebuild + EAS-compatible config. The
`expo-image-picker` plugin in `app.json` declares the camera and
photo permission strings; no manual native edits are required.

```bash
npx expo prebuild           # generate ios/ + android/ projects
npx expo run:ios --device   # release build to a connected iOS device
npx expo run:android        # build APK / AAB for Android
```

For OTA updates, configure EAS Update separately —
[`expo-glass-effect`](https://docs.expo.dev/versions/latest/sdk/glass-effect/)
includes a runtime feature-detection helper (`isLiquidGlassAvailable`)
which the `Surface` primitive uses, so older clients automatically fall
back to BlurView without an OTA gate.

---

## Backend

The companion backend lives in [`Backend/`](Backend/). It's a Node
+ Express + MongoDB API with Clerk webhook integration and Cloudinary
image hosting. Refer to that directory's local README for setup; the
mobile app talks to it over standard REST.

---

## License

MIT.
