import React from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { BRAND_COLORS, TAB_CONFIG } from "../constants/colors";

interface TabBackgroundProps {
  backgroundMorph: Animated.SharedValue<number>;
  routesLength: number;
}

export const TabBackground: React.FC<TabBackgroundProps> = ({
  backgroundMorph,
  routesLength,
}) => {
  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const colorProgress = backgroundMorph.value / (routesLength - 1);
    // Create gradient between brand colors
    const hue = interpolate(colorProgress, [0, 1], [16, 170]); // From coral hue to mint hue
    return {
      backgroundColor: `hsla(${hue}, 65%, 70%, 0.1)`,
    };
  });

  return (
    <>
      {/* Blur Background */}
      <BlurView
        intensity={TAB_CONFIG.BLUR_INTENSITY}
        tint="light"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Base Background */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: BRAND_COLORS.SURFACE,
          opacity: 0.95,
        }}
      />

      {/* Dynamic Background Gradient */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.8,
          },
          animatedBackgroundStyle,
        ]}
      />

      {/* Glass overlay */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: `${BRAND_COLORS.SECONDARY}20`, // Secondary with 20% opacity
          borderWidth: 1,
          borderColor: BRAND_COLORS.BORDER_LIGHT,
          borderRadius: TAB_CONFIG.BORDER_RADIUS,
        }}
      />

      {/* Bottom accent line */}
      <LinearGradient
        colors={["transparent", BRAND_COLORS.PRIMARY, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          opacity: 0.6,
        }}
      />
    </>
  );
};