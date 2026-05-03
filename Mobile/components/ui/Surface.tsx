import React, { memo, useMemo } from "react";
import { Platform, StyleSheet, View, type ViewProps, type ViewStyle } from "react-native";
import { BlurView, type BlurTint } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";

import { useTheme } from "@/hooks/useTheme";

/**
 * Variants describe presentational intent, not implementation.
 *  - `glass`   → translucent, layered. Renders Liquid Glass on iOS 26+,
 *                BlurView on iOS < 26, and a tinted flat surface on Android.
 *                Per project policy: BlurView is **never** used on Android.
 *  - `solid`   → opaque themed surface for cards and panels.
 *  - `sunken`  → recessed input/section backgrounds.
 *  - `raised`  → elevated cards with theme-aware shadow.
 */
export type SurfaceVariant = "glass" | "solid" | "sunken" | "raised";

export interface SurfaceProps extends ViewProps {
  /** Visual treatment. Defaults to `solid`. */
  variant?: SurfaceVariant;
  /** Border radius shorthand using design tokens. */
  radius?: number;
  /**
   * Glass intensity (iOS BlurView fallback only). Ignored on Android and
   * on iOS 26+ where the OS controls Liquid Glass material.
   */
  intensity?: number;
  /**
   * Glass tint hint forwarded to the iOS Liquid Glass renderer.
   * For BlurView fallback, the tint is mapped to a `BlurTint` keyword.
   */
  tintColor?: string;
  /** When true, the glass surface participates in interactive material highlights (iOS 26+). */
  interactive?: boolean;
  /** NativeWind utility classes. */
  className?: string;
  children?: React.ReactNode;
}

const isIOS = Platform.OS === "ios";
const liquidGlassReady = isIOS && isLiquidGlassAvailable();

/**
 * Cross-platform Surface primitive.
 *
 * Why this exists: BlurView on Android is forbidden by project policy
 * because the system blur is not GPU-accelerated on most low-end devices
 * (it forces software composition and tanks scroll FPS). Replacing every
 * call site with a Platform.select would litter the codebase, so all
 * translucent material flows through this single primitive.
 */
function SurfaceImpl({
  variant = "solid",
  radius,
  intensity = 24,
  tintColor,
  interactive = false,
  style,
  children,
  ...rest
}: SurfaceProps) {
  const { colors, mode, elevation } = useTheme();

  const baseStyle = useMemo<ViewStyle>(() => {
    const r: ViewStyle = {};
    if (radius != null) r.borderRadius = radius;
    return r;
  }, [radius]);

  // ── glass ────────────────────────────────────────────────────────────────
  if (variant === "glass") {
    if (liquidGlassReady) {
      return (
        <GlassView
          style={[baseStyle, style]}
          glassEffectStyle="regular"
          tintColor={tintColor}
          isInteractive={interactive}
          {...(rest as ViewProps)}
        >
          {children}
        </GlassView>
      );
    }

    if (isIOS) {
      const blurTint: BlurTint = mode === "dark" ? "dark" : "light";
      return (
        <BlurView
          tint={blurTint}
          intensity={intensity}
          style={[baseStyle, style]}
          // expo-blur renders a host view that NativeWind can style.
          {...(rest as ViewProps)}
        >
          {children}
        </BlurView>
      );
    }

    // Android: flat surface tinted to mimic translucency without a real blur.
    return (
      <View
        style={[
          {
            backgroundColor: colors.overlay.glassTint,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border.subtle,
          },
          baseStyle,
          style,
        ]}
        {...rest}
      >
        {children}
      </View>
    );
  }

  // ── solid / sunken / raised ──────────────────────────────────────────────
  const surfaceColor =
    variant === "sunken"
      ? colors.surface.sunken
      : variant === "raised"
      ? colors.surface.raised
      : colors.surface.primary;

  const raisedShadow: ViewStyle =
    variant === "raised"
      ? {
          shadowColor: "#000",
          shadowOffset: elevation.md.shadowOffset,
          shadowOpacity: mode === "dark" ? 0.6 : elevation.md.shadowOpacity,
          shadowRadius: elevation.md.shadowRadius,
          elevation: elevation.md.elevation,
        }
      : {};

  return (
    <View
      style={[{ backgroundColor: surfaceColor }, raisedShadow, baseStyle, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

/**
 * Memoised export. Surface is rendered inside lists and headers where
 * stable identity matters for FlashList/Reanimated parents.
 */
export const Surface = memo(SurfaceImpl);
Surface.displayName = "Surface";
