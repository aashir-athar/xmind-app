import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { BRAND_COLORS } from "@/constants/colors";
import {
  responsiveSize,
  responsivePadding,
  responsiveMargin,
  responsiveBorderRadius,
  responsiveFontSize,
  responsiveIconSize,
} from "@/utils/responsive";

interface CustomLoadingProps {
  message?: string;
  size?: "small" | "medium" | "large";
  variant?: "screen" | "inline" | "modal";
  intensity?: number; // Blur intensity
  colors?: string[]; // Custom gradient colors
  showDots?: boolean; // Toggle dots animation
  accessibilityLabel?: string; // Accessibility support
}

const CustomLoading: React.FC<CustomLoadingProps> = ({
  message = "Loading...",
  size = "medium",
  variant = "screen",
  intensity = 8,
  colors = [`${BRAND_COLORS.SURFACE}95`, `${BRAND_COLORS.SURFACE}85`],
  showDots = true,
  accessibilityLabel = "Loading indicator",
}) => {
  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.7);
  const rotation = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  // Performance optimization: Use useEffect cleanup to prevent memory leaks
  useEffect(() => {
    // Entrance animation
    opacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withTiming(1, { duration: 500, easing: Easing.elastic(1.2) });

    // Smooth continuous rotation
    rotation.value = withRepeat(
      withTiming(360, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );

    // Text animation with subtle bounce
    textOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    textTranslateY.value = withDelay(
      300,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.back(0.5)) })
    );

    return () => {
      // Reset animations on unmount
      opacity.value = 0;
      scale.value = 0.7;
      rotation.value = 0;
      textOpacity.value = 0;
      textTranslateY.value = 20;
    };
  }, []);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const rotationAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Variant-specific styles with improved scalability
  const getVariantStyles = () => {
    switch (variant) {
      case "inline":
        return {
          container: {
            padding: responsivePadding(16),
            alignItems: "center",
            justifyContent: "center",
          },
          background: {
            borderRadius: responsiveBorderRadius(16),
            padding: responsivePadding(20),
          },
        };
      case "modal":
        return {
          container: {
            padding: responsivePadding(24),
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${BRAND_COLORS.SURFACE}50`,
            borderRadius: responsiveBorderRadius(20),
          },
          background: {
            borderRadius: responsiveBorderRadius(20),
            padding: responsivePadding(28),
          },
        };
      default: // screen
        return {
          container: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: responsivePadding(24),
            backgroundColor: `${BRAND_COLORS.SURFACE}50`,
          },
          background: {
            borderRadius: responsiveBorderRadius(28),
            padding: responsivePadding(36),
          },
        };
    }
  };

  // Size-specific configurations
  const getSizeConfig = () => {
    switch (size) {
      case "small":
        return {
          indicatorSize: responsiveSize(24),
          fontSize: responsiveFontSize(14),
          padding: responsivePadding(16),
        };
      case "large":
        return {
          indicatorSize: responsiveSize(48),
          fontSize: responsiveFontSize(18),
          padding: responsivePadding(32),
        };
      default: // medium
        return {
          indicatorSize: responsiveSize(36),
          fontSize: responsiveFontSize(16),
          padding: responsivePadding(24),
        };
    }
  };

  const variantStyles = getVariantStyles();
  const { indicatorSize, fontSize, padding } = getSizeConfig();

  return (
    <View
      style={[styles.container, variantStyles.container]}
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={[styles.animatedContainer, containerAnimatedStyle]}>
        <BlurView
          intensity={intensity}
          tint="light"
          style={[styles.blurView, variantStyles.background]}
        >
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.gradient,
              { padding, borderRadius: responsiveBorderRadius(24) },
            ]}
          >
            {/* Loading Indicator Container */}
            <View
              style={[
                styles.indicatorContainer,
                {
                  width: indicatorSize + responsiveSize(12),
                  height: indicatorSize + responsiveSize(12),
                  borderRadius: responsiveBorderRadius(
                    (indicatorSize + responsiveSize(12)) / 2
                  ),
                  borderWidth: 1.5,
                  borderColor: `${BRAND_COLORS.PRIMARY}20`,
                },
              ]}
            >
              <Animated.View style={rotationAnimatedStyle}>
                <ActivityIndicator
                  size={size}
                  color={BRAND_COLORS.PRIMARY}
                  style={{ width: indicatorSize, height: indicatorSize }}
                />
              </Animated.View>
            </View>

            {/* Loading Text */}
            <Animated.Text
              style={[styles.text, textAnimatedStyle, { fontSize }]}
            >
              <Text
                style={{
                  fontWeight: "600",
                  color: BRAND_COLORS.TEXT_PRIMARY,
                  textAlign: "center",
                  letterSpacing: 0.6,
                }}
              >
                {message}
              </Text>
            </Animated.Text>

            {/* Subtle dots animation */}
            {showDots && (
              <View style={styles.dotsContainer}>
                {[0, 1, 2].map((index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.dot,
                      useAnimatedStyle(() => ({
                        opacity: interpolate(
                          rotation.value,
                          [index * 120, index * 120 + 60, index * 120 + 120],
                          [0.3, 1, 0.3],
                          "clamp"
                        ),
                        transform: [
                          {
                            scale: interpolate(
                              rotation.value,
                              [
                                index * 120,
                                index * 120 + 60,
                                index * 120 + 120,
                              ],
                              [0.8, 1.2, 0.8],
                              "clamp"
                            ),
                          },
                        ],
                      })),
                    ]}
                  />
                ))}
              </View>
            )}
          </LinearGradient>
        </BlurView>
      </Animated.View>
    </View>
  );
};

// Static styles for better performance and readability
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  animatedContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  blurView: {
    shadowColor: BRAND_COLORS.PRIMARY,
    shadowOffset: { width: 0, height: responsiveSize(6) },
    shadowOpacity: 0.2,
    shadowRadius: responsiveSize(12),
    elevation: 10,
    overflow: "hidden",
  },
  gradient: {
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorContainer: {
    backgroundColor: `${BRAND_COLORS.PRIMARY}08`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: responsiveMargin(16),
  },
  text: {
    marginTop: responsiveMargin(12),
  },
  dotsContainer: {
    flexDirection: "row",
    marginTop: responsiveMargin(12),
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: responsiveSize(6),
    height: responsiveSize(6),
    borderRadius: responsiveBorderRadius(3),
    backgroundColor: BRAND_COLORS.PRIMARY_LIGHT,
    marginHorizontal: responsiveMargin(4),
  },
});

export default CustomLoading;
