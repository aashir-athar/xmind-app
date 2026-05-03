import React, { memo, useCallback } from "react";
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface IconButtonProps
  extends Omit<PressableProps, "style" | "children" | "onPress"> {
  /** The icon node to render. Provided as `children` for flexibility. */
  children: React.ReactNode;
  size?: number;
  variant?: "ghost" | "tinted" | "filled";
  onPress?: (event: GestureResponderEvent) => void;
  haptics?: boolean;
  accessibilityLabel: string;
  /** NativeWind utility classes. */
  className?: string;
  style?: ViewStyle;
}

/**
 * Compact circular pressable used for header actions, modal dismiss,
 * and inline controls. Always at least 44x44 hit area for accessibility.
 */
function IconButtonImpl({
  children,
  size = 40,
  variant = "ghost",
  onPress,
  haptics = true,
  accessibilityLabel,
  className,
  style,
  disabled,
  ...rest
}: IconButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const onPressIn = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 18, stiffness: 360, mass: 0.5 });
  }, [scale]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 18, stiffness: 360, mass: 0.5 });
  }, [scale]);

  const onPressInternal = useCallback(
    (e: GestureResponderEvent) => {
      if (haptics) Haptics.selectionAsync().catch(() => undefined);
      onPress?.(e);
    },
    [haptics, onPress]
  );

  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bg =
    variant === "filled"
      ? colors.surface.secondary
      : variant === "tinted"
      ? colors.overlay.press
      : "transparent";

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={8}
      onPress={onPressInternal}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      className={className}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bg,
          opacity: disabled ? 0.5 : 1,
        },
        animated,
        style,
      ]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}

export const IconButton = memo(IconButtonImpl);
IconButton.displayName = "IconButton";
