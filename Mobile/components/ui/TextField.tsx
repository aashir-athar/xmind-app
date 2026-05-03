import React, { forwardRef, memo, useCallback, useState } from "react";
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from "react-native";

import { Text } from "./Text";
import { useTheme } from "@/hooks/useTheme";

export interface TextFieldProps extends TextInputProps {
  /** Label rendered above the input. */
  label?: string;
  /** Inline help text — replaced by `error` when present. */
  helper?: string;
  error?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  containerStyle?: ViewStyle;
}

/**
 * Themed input. Focus ring uses the brand tint to draw the eye and
 * confirm the active field — meaningful colour movement that maps to
 * a user action, not decoration.
 */
const TextFieldImpl = forwardRef<TextInput, TextFieldProps>(function TextFieldImpl(
  {
    label,
    helper,
    error,
    leading,
    trailing,
    containerStyle,
    style,
    onFocus,
    onBlur,
    placeholderTextColor,
    ...rest
  },
  ref
) {
  const { colors, radii, spacing, typography } = useTheme();
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback<NonNullable<TextInputProps["onFocus"]>>(
    (e) => {
      setFocused(true);
      onFocus?.(e);
    },
    [onFocus]
  );

  const handleBlur = useCallback<NonNullable<TextInputProps["onBlur"]>>(
    (e) => {
      setFocused(false);
      onBlur?.(e);
    },
    [onBlur]
  );

  const borderColor = error
    ? colors.tint.danger
    : focused
    ? colors.border.focus
    : colors.border.subtle;

  return (
    <View style={containerStyle}>
      {label ? (
        <Text variant="label" tone="secondary" style={{ marginBottom: spacing.xs }}>
          {label}
        </Text>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          paddingHorizontal: spacing.base,
          height: 52,
          borderRadius: radii.lg,
          backgroundColor: colors.surface.secondary,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor,
        }}
      >
        {leading}
        <TextInput
          ref={ref}
          placeholderTextColor={placeholderTextColor ?? colors.text.tertiary}
          style={StyleSheet.flatten([
            {
              flex: 1,
              fontSize: typography.body.size,
              lineHeight: typography.body.lineHeight,
              color: colors.text.primary,
              paddingVertical: 0,
            },
            style,
          ])}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {trailing}
      </View>

      {error || helper ? (
        <Text
          variant="caption"
          tone={error ? "danger" : "tertiary"}
          style={{ marginTop: spacing.xs }}
        >
          {error ?? helper}
        </Text>
      ) : null}
    </View>
  );
});

export const TextField = memo(TextFieldImpl);
TextField.displayName = "TextField";
