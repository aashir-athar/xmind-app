import React, { useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  withSequence,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS, TAB_GRADIENTS, TAB_CONFIG } from "../constants/colors";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface TabIconProps {
  route: {
    name: string;
    key: string;
  };
  isFocused: boolean;
  onPress: () => void;
  index: number;
  tabWidth: number;
}

const getIconConfig = (routeName: string, isFocused: boolean) => {
  const configs = {
    index: {
      iconName: isFocused ? "home" : "home-outline",
      gradientColors: TAB_GRADIENTS.index,
    },
    search: {
      iconName: isFocused ? "search" : "search-outline",
      gradientColors: TAB_GRADIENTS.search,
    },
    notifications: {
      iconName: isFocused ? "notifications" : "notifications-outline",
      gradientColors: TAB_GRADIENTS.notifications,
    },
    messages: {
      iconName: isFocused ? "chatbubble" : "chatbubble-outline",
      gradientColors: TAB_GRADIENTS.messages,
    },
    profile: {
      iconName: isFocused ? "person" : "person-outline",
      gradientColors: TAB_GRADIENTS.profile,
    },
  };

  return configs[routeName as keyof typeof configs] || configs.index;
};

export const TabIcon: React.FC<TabIconProps> = ({
  route,
  isFocused,
  onPress,
  index,
  tabWidth,
}) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const rippleScale = useSharedValue(0);

  const { iconName, gradientColors } = getIconConfig(route.name, isFocused);

  useEffect(() => {
    if (isFocused) {
      // Entrance animation
      scale.value = withSequence(
        withTiming(1.2, { duration: 200 }),
        withSpring(1, { damping: 8, stiffness: 100 })
      );
      translateY.value = withSpring(-8, { damping: 12, stiffness: 150 });
      rotation.value = withSequence(
        withTiming(360, { duration: 600 }),
        withTiming(0, { duration: 0 })
      );
      glowOpacity.value = withTiming(1, { duration: 300 });

      // Ripple effect
      rippleScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1.5, { duration: 400 }),
        withTiming(0, { duration: 200 })
      );
    } else {
      // Exit animation
      scale.value = withSpring(1, { damping: 10, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 12, stiffness: 150 });
      glowOpacity.value = withTiming(0, { duration: 200 });
      rippleScale.value = withTiming(0, { duration: 200 });
    }
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [
      { scale: interpolate(glowOpacity.value, [0, 1], [0.8, 1.2]) },
    ],
  }));

  const animatedRippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: interpolate(rippleScale.value, [0, 1, 1.5], [0, 0.6, 0]),
  }));

  const handlePress = () => {
    // Haptic feedback animation
    scale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );
    onPress();
  };

  return (
    <AnimatedTouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          width: tabWidth,
          height: 70,
          position: "relative",
        },
        animatedIconStyle,
      ]}
    >
      {/* Ripple Effect */}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: gradientColors[0],
          },
          animatedRippleStyle,
        ]}
      />

      {/* Glow Effect */}
      {isFocused && (
        <Animated.View
          style={[
            {
              position: "absolute",
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: gradientColors[0],
              opacity: 0.3,
              shadowColor: gradientColors[0],
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 20,
              elevation: 15,
            },
            animatedGlowStyle,
          ]}
        />
      )}

      {/* Main Icon Container */}
      {isFocused ? (
        <AnimatedLinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: TAB_CONFIG.ICON_CONTAINER_SIZE,
            height: TAB_CONFIG.ICON_CONTAINER_SIZE,
            borderRadius: TAB_CONFIG.ICON_CONTAINER_SIZE / 2,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: gradientColors[1],
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: TAB_CONFIG.SHADOW_ELEVATION,
          }}
        >
          <Ionicons
            name={iconName as keyof typeof Ionicons.glyphMap}
            size={TAB_CONFIG.ICON_SIZE_ACTIVE}
            color={BRAND_COLORS.SURFACE}
          />
        </AnimatedLinearGradient>
      ) : (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: BRAND_COLORS.SURFACE_MUTED,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: BRAND_COLORS.BORDER_LIGHT,
            shadowColor: BRAND_COLORS.PRIMARY,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Ionicons
            name={iconName as keyof typeof Ionicons.glyphMap}
            size={TAB_CONFIG.ICON_SIZE_INACTIVE}
            color={BRAND_COLORS.ICON_SECONDARY}
          />
        </View>
      )}
    </AnimatedTouchableOpacity>
  );
};