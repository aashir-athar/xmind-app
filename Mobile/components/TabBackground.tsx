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
      backgroundColor: `${BRAND_COLORS.PRIMARY}08`,
    };
  });

  return (
    <>
      <BlurView
        intensity={20}
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
            opacity: 0.6,
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
          backgroundColor: `${BRAND_COLORS.PRIMARY}15`,
          borderWidth: 1,
          borderColor: `${BRAND_COLORS.PRIMARY}20`,
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
          height: 1,
          opacity: 0.3,
        }}
      />
    </>
  );
};
