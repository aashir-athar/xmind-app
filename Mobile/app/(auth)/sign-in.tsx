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
import { useSocialAuth } from "../../hooks/useSocialAuth";
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
  baseScale 
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

export default function Index() {
  const { handleSocialAuth, isLoading } = useSocialAuth();

  // Animation values
  const logoScale = useSharedValue(0.7);
  const logoOpacity = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30 * baseScale);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(25 * baseScale);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(50 * baseScale);
  const backgroundOpacity = useSharedValue(0);
  const termsOpacity = useSharedValue(0);
  const termsTranslateY = useSharedValue(20 * baseScale);

  useEffect(() => {
    // Staggered entrance animations with enhanced timing
    logoScale.value = withSpring(1, { damping: 18, stiffness: 90 });
    logoOpacity.value = withTiming(1, { duration: 1000 });
    logoRotation.value = withDelay(200, withSpring(360, { damping: 20, stiffness: 60 }));
    
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 700 }));
    titleTranslateY.value = withDelay(400, withSpring(0, { damping: 15 }));
    
    subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    subtitleTranslateY.value = withDelay(600, withSpring(0, { damping: 15 }));
    
    buttonsOpacity.value = withDelay(800, withTiming(1, { duration: 700 }));
    buttonsTranslateY.value = withDelay(800, withSpring(0, { damping: 15 }));
    
    backgroundOpacity.value = withDelay(300, withTiming(0.1, { duration: 1200 }));
    
    termsOpacity.value = withDelay(1000, withTiming(1, { duration: 500 }));
    termsTranslateY.value = withDelay(1000, withSpring(0, { damping: 15 }));
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` }
    ],
    opacity: logoOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const termsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: termsOpacity.value,
    transform: [{ translateY: termsTranslateY.value }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: BRAND_COLORS.BACKGROUND }}>
      <StatusBar barStyle="dark-content" backgroundColor={BRAND_COLORS.BACKGROUND} />
      
      {/* Dynamic Background Gradient */}
      <Animated.View
        style={[
          { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
          backgroundAnimatedStyle,
        ]}
      >
        <LinearGradient
          colors={[
            `${BRAND_COLORS.PRIMARY}08`,
            `${BRAND_COLORS.PRIMARY}04`,
            `${BRAND_COLORS.PRIMARY}02`,
            BRAND_COLORS.BACKGROUND
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>

      <View style={{ flex: 1, paddingHorizontal: responsivePadding(28) }}>
        {/* Logo Section */}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Animated.View style={logoAnimatedStyle}>
            <View
              style={{
                width: responsiveSize(140),
                height: responsiveSize(140),
                borderRadius: responsiveBorderRadius(70),
                backgroundColor: BRAND_COLORS.PRIMARY,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: BRAND_COLORS.PRIMARY,
                shadowOffset: { width: 0, height: responsiveSize(12) },
                shadowOpacity: 0.3,
                shadowRadius: responsiveSize(20),
                elevation: 15,
                marginBottom: responsiveMargin(32),
                borderWidth: 3,
                borderColor: `${BRAND_COLORS.PRIMARY}20`,
              }}
            >
            <Image
                source={require("../../assets/images/xMind-Logo1.png")}
                style={{
                  width: responsiveSize(80),
                  height: responsiveSize(80),
                }}
              resizeMode="contain"
            />
          </View>
          </Animated.View>

          {/* Title Section */}
          <Animated.View style={titleAnimatedStyle}>
            <Text
              style={{
                fontSize: responsiveFontSize(40),
                fontWeight: "900",
                color: BRAND_COLORS.PRIMARY,
                letterSpacing: 1.5,
                marginBottom: responsiveMargin(16),
                textAlign: "center",
                textShadowColor: `${BRAND_COLORS.PRIMARY}20`,
                textShadowOffset: { width: 0, height: responsiveSize(3) },
                textShadowRadius: responsiveSize(6),
              }}
            >
              xMind
            </Text>
          </Animated.View>

          {/* Subtitle Section */}
          <Animated.View style={subtitleAnimatedStyle}>
            <Text
              style={{
                fontSize: responsiveFontSize(20),
                color: BRAND_COLORS.TEXT_SECONDARY,
                fontWeight: "600",
                textAlign: "center",
                lineHeight: responsiveSize(28),
                paddingHorizontal: responsivePadding(24),
                marginBottom: responsiveMargin(8),
              }}
            >
              Share your thoughts with the world
            </Text>
            <Text
              style={{
                fontSize: responsiveFontSize(16),
                color: BRAND_COLORS.TEXT_SECONDARY,
                fontWeight: "400",
                textAlign: "center",
                lineHeight: responsiveSize(22),
                paddingHorizontal: responsivePadding(32),
                opacity: 0.8,
                marginBottom: responsiveMargin(40),
              }}
            >
              Connect, share, and discover amazing content
            </Text>
          </Animated.View>
        </View>

        {/* Auth Buttons Section */}
        <Animated.View style={[buttonsAnimatedStyle, { marginBottom: responsiveMargin(36) }]}>
          <View style={{ gap: responsiveMargin(18) }}>
            {/* Apple Sign In */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: BRAND_COLORS.SURFACE,
                borderWidth: 2,
                borderColor: `${BRAND_COLORS.PRIMARY}25`,
                borderRadius: responsiveBorderRadius(32),
                paddingVertical: responsivePadding(20),
                paddingHorizontal: responsivePadding(32),
                shadowColor: BRAND_COLORS.PRIMARY,
                shadowOffset: { width: 0, height: responsiveSize(8) },
                shadowOpacity: 0.15,
                shadowRadius: responsiveSize(16),
                elevation: 8,
              }}
              onPress={() => handleSocialAuth("oauth_apple")}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={BRAND_COLORS.PRIMARY} />
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={require("../../assets/images/apple.png")}
                    style={{
                      width: responsiveSize(28),
                      height: responsiveSize(28),
                      marginRight: responsiveMargin(16),
                    }}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      color: BRAND_COLORS.TEXT_PRIMARY,
                      fontWeight: "700",
                      fontSize: responsiveFontSize(18),
                      letterSpacing: 0.4,
                    }}
                  >
                    Continue with Apple
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Google Sign In */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: BRAND_COLORS.SURFACE,
                borderWidth: 2,
                borderColor: `${BRAND_COLORS.PRIMARY}25`,
                borderRadius: responsiveBorderRadius(32),
                paddingVertical: responsivePadding(20),
                paddingHorizontal: responsivePadding(32),
                shadowColor: BRAND_COLORS.PRIMARY,
                shadowOffset: { width: 0, height: responsiveSize(8) },
                shadowOpacity: 0.15,
                shadowRadius: responsiveSize(16),
                elevation: 8,
              }}
              onPress={() => handleSocialAuth("oauth_google")}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={BRAND_COLORS.PRIMARY} />
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={require("../../assets/images/google.png")}
                    style={{
                      width: responsiveSize(28),
                      height: responsiveSize(28),
                      marginRight: responsiveMargin(16),
                    }}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      color: BRAND_COLORS.TEXT_PRIMARY,
                      fontWeight: "700",
                      fontSize: responsiveFontSize(18),
                      letterSpacing: 0.4,
                    }}
                  >
                    Continue with Google
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Terms Section */}
        <Animated.View style={[termsAnimatedStyle, { marginBottom: responsiveMargin(32) }]}>
          <Text
            style={{
              color: BRAND_COLORS.TEXT_SECONDARY,
              fontSize: responsiveFontSize(12),
              lineHeight: responsiveSize(18),
              textAlign: "center",
              paddingHorizontal: responsivePadding(24),
              opacity: 0.7,
            }}
          >
            By signing up, you agree to our{" "}
            <Text style={{ color: BRAND_COLORS.PRIMARY, fontWeight: "600" }}>
              Terms
            </Text>
            {", "}
            <Text style={{ color: BRAND_COLORS.PRIMARY, fontWeight: "600" }}>
              Privacy Policy
            </Text>
            {", and "}
            <Text style={{ color: BRAND_COLORS.PRIMARY, fontWeight: "600" }}>
              Cookie Use
            </Text>
            .
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}
