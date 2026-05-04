import React, { memo, useMemo } from "react";
import { type ImageStyle, View, type ViewStyle } from "react-native";
import { Image, type ImageSource } from "expo-image";

import { Text } from "./Text";
import { useTheme } from "@/hooks/useTheme";

export interface AvatarProps {
  /** Remote image URL, an expo-image source, or a numeric require(). */
  source?: ImageSource | string | number | null;
  /** Used to generate fallback initials when no image is available. */
  name?: string;
  /** Avatar diameter. */
  size?: number;
  /** Render a thin ring around the avatar (used for verified badges). */
  ringColor?: string;
  /** NativeWind utility classes. */
  className?: string;
  style?: ViewStyle;
}

function initialsFor(name?: string): string {
  if (!name) return "";
  const trimmed = name.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

/**
 * Themed avatar with deterministic fallback initials. Used in lists where
 * the network image may take a beat to land — initials prevent layout
 * shift and feel intentional rather than a placeholder hole.
 */
function AvatarImpl({ source, name, size = 44, ringColor, className, style }: AvatarProps) {
  const { colors } = useTheme();

  const resolvedSource = useMemo<ImageSource | number | null>(() => {
    if (source == null) return null;
    if (typeof source === "string") {
      const trimmed = source.trim();
      return trimmed ? { uri: trimmed } : null;
    }
    return source;
  }, [source]);

  const ring: ViewStyle = ringColor
    ? { borderWidth: 2, borderColor: ringColor }
    : {};

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: colors.surface.secondary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...ring,
  };

  const imageStyle: ImageStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <View className={className} style={[containerStyle, style]}>
      {resolvedSource ? (
        <Image
          source={resolvedSource}
          style={imageStyle}
          contentFit="cover"
          // Cache the avatar across screen mounts; same uri renders instantly.
          cachePolicy="memory-disk"
          // Tiny placeholder fade keeps the avatar from flashing in.
          transition={120}
        />
      ) : (
        <Text
          variant={size >= 56 ? "title" : "label"}
          tone="secondary"
          weight="700"
          style={{ fontSize: Math.max(12, size * 0.38) }}
        >
          {initialsFor(name)}
        </Text>
      )}
    </View>
  );
}

export const Avatar = memo(AvatarImpl);
Avatar.displayName = "Avatar";
