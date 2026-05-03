import React, { memo } from "react";
import {
  StyleSheet,
  Text as RNText,
  type TextProps as RNTextProps,
  type TextStyle,
} from "react-native";

import { useTheme } from "@/hooks/useTheme";
import type { TypographyToken } from "@/constants/tokens";

type TextTone = "primary" | "secondary" | "tertiary" | "inverse" | "tint" | "danger" | "success";

export interface TextProps extends RNTextProps {
  /** Type-scale token (display, headline, title, body, …). */
  variant?: TypographyToken;
  /** Semantic colour role. Mapped through the active palette. */
  tone?: TextTone;
  /** Center / left / right shortcut. */
  align?: TextStyle["textAlign"];
  /** Override weight while keeping the variant scale. */
  weight?: TextStyle["fontWeight"];
  /** NativeWind utility classes. */
  className?: string;
}

/**
 * Themed Text primitive. Every label in the app routes through this so
 * the type ramp + colour palette stay coherent across light and dark.
 */
function ThemedTextImpl({
  variant = "body",
  tone = "primary",
  align,
  weight,
  style,
  ...rest
}: TextProps) {
  const { typography, colors } = useTheme();
  const t = typography[variant];

  const color =
    tone === "primary"
      ? colors.text.primary
      : tone === "secondary"
      ? colors.text.secondary
      : tone === "tertiary"
      ? colors.text.tertiary
      : tone === "inverse"
      ? colors.text.inverse
      : tone === "tint"
      ? colors.tint.primary
      : tone === "danger"
      ? colors.tint.danger
      : colors.tint.success;

  return (
    <RNText
      allowFontScaling
      style={StyleSheet.flatten([
        {
          fontSize: t.size,
          lineHeight: t.lineHeight,
          letterSpacing: t.letterSpacing,
          fontWeight: (weight ?? t.weight) as TextStyle["fontWeight"],
          color,
          textAlign: align,
        },
        style,
      ])}
      {...rest}
    />
  );
}

export const Text = memo(ThemedTextImpl);
Text.displayName = "Text";
