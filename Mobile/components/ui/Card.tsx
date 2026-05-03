import React, { memo } from "react";
import { type ViewStyle } from "react-native";

import { Surface, type SurfaceVariant } from "./Surface";
import { useTheme } from "@/hooks/useTheme";

export interface CardProps {
  children: React.ReactNode;
  /** Surface treatment used by this card. Defaults to `solid`. */
  variant?: SurfaceVariant;
  /** Inner padding. Defaults to `base` (16). */
  padding?: number;
  /** Border radius. Defaults to `radii.lg`. */
  radius?: number;
  /** Stretch to parent width. */
  fullWidth?: boolean;
  /** NativeWind utility classes. Merges with `style`. */
  className?: string;
  style?: ViewStyle;
}

/**
 * Card composition. Wraps `Surface` and adds the standard padding
 * and outer border that the design system prescribes for cards.
 *
 * Accepts `className` so consumers can extend layout via NativeWind
 * utilities without having to touch internal styles.
 */
function CardImpl({
  children,
  variant = "solid",
  padding,
  radius,
  fullWidth = true,
  className,
  style,
}: CardProps) {
  const { spacing, radii, colors } = useTheme();
  const r = radius ?? radii.lg;
  const p = padding ?? spacing.base;

  return (
    <Surface
      variant={variant}
      radius={r}
      className={className}
      style={{
        padding: p,
        alignSelf: fullWidth ? "stretch" : "auto",
        borderColor: colors.border.subtle,
        ...style,
      }}
    >
      {children}
    </Surface>
  );
}

export const Card = memo(CardImpl);
Card.displayName = "Card";
