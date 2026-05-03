import React, { memo, useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type PressableProps,
  type ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Text } from "./Text";
import { useTheme } from "@/hooks/useTheme";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<PressableProps, "style" | "onPress" | "children"> {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Optional leading icon node (rendered before the label). */
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  /** Fill the parent's width. */
  fullWidth?: boolean;
  loading?: boolean;
  /** Suppress haptics if the parent already triggers them. */
  haptics?: boolean;
  /** NativeWind utility classes. */
  className?: string;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * 2026 Button — capsule-shaped, motion-aware, accessible by default.
 *
 * Psychology notes:
 *  - Tap target ≥ 48px on every size (Fitts's Law + WCAG 2.5.5).
 *  - Subtle spring on press signals "I heard you" without theatrics.
 *  - Primary uses brand tint to anchor the user's focal CTA per screen.
 */
function ButtonImpl({
  label,
  onPress,
  variant = "primary",
  size = "md",
  leading,
  trailing,
  fullWidth,
  loading,
  haptics = true,
  disabled,
  className,
  style,
  ...rest
}: ButtonProps) {
  const { colors, radii, spacing, mode } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const heightFor: Record<ButtonSize, number> = { sm: 40, md: 48, lg: 56 };
  const padX: Record<ButtonSize, number> = {
    sm: spacing.base,
    md: spacing.lg,
    lg: spacing.xl,
  };

  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";
  const isGhost = variant === "ghost";
  const isDanger = variant === "danger";

  const bg = isPrimary
    ? colors.tint.primary
    : isDanger
    ? colors.tint.danger
    : isSecondary
    ? colors.surface.secondary
    : "transparent";

  const fg =
    isPrimary || isDanger
      ? colors.text.onTint
      : isGhost
      ? colors.tint.primary
      : colors.text.primary;

  const border =
    isSecondary && mode === "light"
      ? { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border.subtle }
      : isGhost
      ? { borderWidth: 1, borderColor: colors.border.subtle }
      : {};

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 18, stiffness: 320, mass: 0.6 });
    opacity.value = withTiming(0.9, { duration: 80 });
  }, [scale, opacity]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 18, stiffness: 320, mass: 0.6 });
    opacity.value = withTiming(1, { duration: 120 });
  }, [scale, opacity]);

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (haptics) {
        // Light impact on every press. iOS feels native; Android-side
        // expo-haptics fans out to platform implementations gracefully.
        Haptics.selectionAsync().catch(() => undefined);
      }
      onPress?.(e);
    },
    [haptics, onPress]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      accessibilityLabel={label}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      hitSlop={8}
      className={className}
      style={[
        {
          height: heightFor[size],
          paddingHorizontal: padX[size],
          borderRadius: radii.pill,
          backgroundColor: bg,
          alignSelf: fullWidth ? "stretch" : "flex-start",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          opacity: disabled ? 0.5 : 1,
        },
        border,
        animatedStyle,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
          {leading}
          <Text
            variant={size === "lg" ? "subtitle" : "label"}
            tone={isPrimary || isDanger ? "inverse" : isGhost ? "tint" : "primary"}
            style={{ color: fg }}
          >
            {label}
          </Text>
          {trailing}
        </View>
      )}
    </AnimatedPressable>
  );
}

export const Button = memo(ButtonImpl);
Button.displayName = "Button";
