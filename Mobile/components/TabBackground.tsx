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
    const denom = Math.max(1, routesLength - 1);
    const colorProgress = backgroundMorph.value / denom;
    const hue = interpolate(colorProgress, [0, 1], [16, 170]);
    return {
      backgroundColor: `hsla(${hue}, 65%, 70%, 0.1)`,
    };
  });

  return (
    <>
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
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: `${BRAND_COLORS.SECONDARY}20`,
          borderWidth: 1,
          borderColor: BRAND_COLORS.BORDER_LIGHT,
          borderRadius: TAB_CONFIG.BORDER_RADIUS,
        }}
      />
      <LinearGradient
        colors={["transparent", BRAND_COLORS.PRIMARY, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 0,
          opacity: 0.6,
        }}
      />
    </>
  );
};
