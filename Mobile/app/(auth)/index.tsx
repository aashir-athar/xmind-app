import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
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
  baseScale,
} from "@/utils/responsive";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  // Animation values
  const heroImageScale = useSharedValue(0.8);
  const heroImageOpacity = useSharedValue(0);
  const heroImageFloat = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(40 * baseScale);
  const backgroundOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.9);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    // Staggered entrance animations
    heroImageScale.value = withSpring(1, { damping: 20, stiffness: 80 });
    heroImageOpacity.value = withTiming(1, { duration: 1200 });

    // Subtle floating animation for hero image
    heroImageFloat.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );

    backgroundOpacity.value = withDelay(
      300,
      withTiming(0.12, { duration: 1500 })
    );

    contentOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    contentTranslateY.value = withDelay(600, withSpring(0, { damping: 15 }));

    buttonScale.value = withDelay(900, withSpring(1, { damping: 15 }));
    buttonOpacity.value = withDelay(900, withTiming(1, { duration: 600 }));
  }, []);

  const heroImageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: heroImageScale.value },
      {
        translateY: interpolate(
          heroImageFloat.value,
          [0, 1],
          [0, -8 * baseScale]
        ),
      },
    ],
    opacity: heroImageOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: buttonOpacity.value,
  }));

  const handleGetStarted = () => {
    router.push("/(auth)/sign-in");
  };

  return (
    <View style={{ flex: 1, backgroundColor: BRAND_COLORS.BACKGROUND }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_COLORS.PRIMARY}
      />

      {/* Dynamic Background Gradient */}
      <Animated.View
        style={[
          { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
          backgroundAnimatedStyle,
        ]}
      >
        <LinearGradient
          colors={[
            BRAND_COLORS.PRIMARY,
            `${BRAND_COLORS.PRIMARY}90`,
            `${BRAND_COLORS.PRIMARY}60`,
            BRAND_COLORS.BACKGROUND,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>

      {/* Hero Section */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Animated.View style={heroImageAnimatedStyle}>
          <View
            style={{
              width: responsiveSize(320),
              height: responsiveSize(240),
              marginBottom: responsiveMargin(40),
              shadowColor: BRAND_COLORS.PRIMARY,
              shadowOffset: { width: 0, height: responsiveSize(12) },
              shadowOpacity: 0.25,
              shadowRadius: responsiveSize(24),
              elevation: 12,
            }}
          >
            <Image
              source={require("../../assets/images/auth2.png")}
              style={{
                width: "100%",
                height: "100%",
              }}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Content Section */}
        <Animated.View style={contentAnimatedStyle}>
          <View
            style={{
              alignItems: "center",
              paddingHorizontal: responsivePadding(32),
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(42),
                fontWeight: "900",
                color: BRAND_COLORS.PRIMARY,
                letterSpacing: 1.5,
                marginBottom: responsiveMargin(16),
                textAlign: "center",
                textShadowColor: `${BRAND_COLORS.PRIMARY}20`,
                textShadowOffset: { width: 0, height: responsiveSize(2) },
                textShadowRadius: responsiveSize(4),
              }}
            >
              Welcome to xMind
            </Text>

            <Text
              style={{
                fontSize: responsiveFontSize(20),
                color: BRAND_COLORS.TEXT_PRIMARY,
                fontWeight: "600",
                textAlign: "center",
                lineHeight: responsiveSize(28),
                marginBottom: responsiveMargin(24),
              }}
            >
              Where thoughts come alive
            </Text>

            <Text
              style={{
                fontSize: responsiveFontSize(16),
                color: BRAND_COLORS.TEXT_SECONDARY,
                fontWeight: "400",
                textAlign: "center",
                lineHeight: responsiveSize(24),
                paddingHorizontal: responsivePadding(20),
                marginBottom: responsiveMargin(40),
              }}
            >
              Connect with amazing people, share your ideas, and discover
              inspiring content from around the world
                  </Text>
                </View>
        </Animated.View>
      </View>

      {/* Bottom Section */}
      <View
        style={{
          paddingBottom: responsivePadding(40),
          paddingHorizontal: responsivePadding(32),
        }}
      >
        <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: BRAND_COLORS.SURFACE,
              borderRadius: responsiveBorderRadius(32),
              paddingVertical: responsivePadding(20),
              paddingHorizontal: responsivePadding(32),
              shadowColor: BRAND_COLORS.PRIMARY,
              shadowOffset: { width: 0, height: responsiveSize(8) },
              shadowOpacity: 0.2,
              shadowRadius: responsiveSize(16),
              elevation: 8,
            }}
            onPress={handleGetStarted}
            activeOpacity={0.9}
          >
            <Text
              style={{
                color: BRAND_COLORS.PRIMARY,
                fontWeight: "800",
                fontSize: responsiveFontSize(18),
                letterSpacing: 0.5,
                marginRight: responsiveMargin(8),
              }}
            >
              Get Started
            </Text>
            <Feather
              name="arrow-right"
              size={responsiveIconSize(20)}
              color={BRAND_COLORS.PRIMARY}
            />
            </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
