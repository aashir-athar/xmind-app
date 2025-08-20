import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  FadeIn,
  SlideInRight,
  interpolate,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND_COLORS } from "@/constants/colors";
import {
  responsiveSize,
  responsivePadding,
  responsiveMargin,
  responsiveBorderRadius,
  responsiveFontSize,
  responsiveIconSize,
} from "@/utils/responsive";

interface VerificationStatusProps {
  isVerified: boolean;
  progress: number;
  statusMessage: string;
  missingRequirements: string[];
  isEligible: boolean;
  isChecking: boolean;
  onVerificationRequest: () => void;
}

const VerificationProgress: React.FC<VerificationStatusProps> = ({
  isVerified,
  progress,
  statusMessage,
  missingRequirements,
  isEligible,
  isChecking,
  onVerificationRequest,
}) => {
  const containerScale = useSharedValue(0.8);
  const containerOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const progressBarWidth = useSharedValue(0);

  useEffect(() => {
    containerOpacity.value = withDelay(900, withTiming(1, { duration: 400 }));
    containerScale.value = withDelay(950, withSpring(1, { damping: 15 }));
    iconScale.value = withDelay(1050, withSpring(1, { damping: 20 }));
    buttonScale.value = withDelay(1100, withSpring(1, { damping: 15 }));

    progressBarWidth.value = withDelay(
      1200,
      withTiming(progress, { duration: 800 })
    );
  }, [isVerified, progress]); // Add progress dependency

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
    opacity: containerOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressBarWidth.value}%`,
  }));

  const handleButtonPress = () => {
    if (isChecking) return;

    buttonScale.value = withSequence(
      withSpring(0.95, { damping: 10 }),
      withSpring(1, { damping: 15 })
    );

    onVerificationRequest();
  };

  const getStatusIcon = () => {
    if (isVerified) {
      return (
        <MaterialCommunityIcons
          name="check-decagram"
          size={responsiveIconSize(20)}
          color={BRAND_COLORS.SUCCESS}
        />
      );
    }

    if (isChecking) {
      return (
        <Feather
          name="clock"
          size={responsiveIconSize(18)}
          color={BRAND_COLORS.SECONDARY}
        />
      );
    }

    return (
      <Ionicons
        name={isEligible ? "checkmark-circle-outline" : "time-outline"}
        size={responsiveIconSize(18)}
        color={isEligible ? BRAND_COLORS.PRIMARY : BRAND_COLORS.WARNING}
      />
    );
  };

  // If verified, show compact verified badge
  if (isVerified) {
    return (
      <Animated.View
        entering={FadeIn.delay(200).springify()}
        style={[
          containerAnimatedStyle,
          {
            marginTop: responsiveMargin(16),
            backgroundColor: `${BRAND_COLORS.SUCCESS}08`,
            borderRadius: responsiveBorderRadius(16),
            padding: responsivePadding(16),
            borderWidth: 1,
            borderColor: `${BRAND_COLORS.SUCCESS}20`,
          },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: responsiveSize(36),
              height: responsiveSize(36),
              borderRadius: responsiveBorderRadius(18),
              backgroundColor: `${BRAND_COLORS.SUCCESS}15`,
              justifyContent: "center",
              alignItems: "center",
              marginRight: responsiveMargin(12),
              borderWidth: 1,
              borderColor: `${BRAND_COLORS.SUCCESS}25`,
            }}
          >
            <Animated.View style={iconAnimatedStyle}>
              {getStatusIcon()}
            </Animated.View>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: responsiveFontSize(16),
                fontWeight: "700",
                color: BRAND_COLORS.TEXT_PRIMARY,
                marginBottom: responsiveMargin(2),
              }}
            >
              Verified Account
            </Text>
            <Text
              style={{
                fontSize: responsiveFontSize(13),
                color: BRAND_COLORS.TEXT_SECONDARY,
                fontWeight: "500",
              }}
            >
              Your account is verified and authentic
            </Text>
          </View>

          <View
            style={{
              backgroundColor: `${BRAND_COLORS.SUCCESS}15`,
              paddingHorizontal: responsivePadding(12),
              paddingVertical: responsivePadding(6),
              borderRadius: responsiveBorderRadius(12),
              borderWidth: 1,
              borderColor: `${BRAND_COLORS.SUCCESS}25`,
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(11),
                color: BRAND_COLORS.SUCCESS,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Verified
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.delay(200).springify()}
      style={[
        containerAnimatedStyle,
        {
          marginTop: responsiveMargin(16),
          backgroundColor: `${BRAND_COLORS.PRIMARY}03`,
          borderRadius: responsiveBorderRadius(16),
          padding: responsivePadding(16),
          borderWidth: 1,
          borderColor: `${BRAND_COLORS.PRIMARY}15`,
        },
      ]}
    >
      {/* Main Status Row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: responsiveMargin(12),
        }}
      >
        <View
          style={{
            width: responsiveSize(36),
            height: responsiveSize(36),
            borderRadius: responsiveBorderRadius(18),
            backgroundColor: isEligible
              ? `${BRAND_COLORS.PRIMARY}15`
              : `${BRAND_COLORS.WARNING}15`,
            justifyContent: "center",
            alignItems: "center",
            marginRight: responsiveMargin(12),
            borderWidth: 1,
            borderColor: isEligible
              ? `${BRAND_COLORS.PRIMARY}25`
              : `${BRAND_COLORS.ACCENT_YELLOW}25`,
          }}
        >
          <Animated.View style={iconAnimatedStyle}>
            {getStatusIcon()}
          </Animated.View>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: responsiveFontSize(16),
              fontWeight: "700",
              color: BRAND_COLORS.TEXT_PRIMARY,
              marginBottom: responsiveMargin(2),
            }}
          >
            Verification Status
          </Text>
          <Text
            style={{
              fontSize: responsiveFontSize(13),
              color: BRAND_COLORS.TEXT_SECONDARY,
              fontWeight: "500",
            }}
          >
            {statusMessage}
          </Text>
        </View>

        {/* Compact Action Button */}
        <Animated.View style={buttonAnimatedStyle}>
          <TouchableOpacity
            onPress={handleButtonPress}
            disabled={(!isEligible && !isChecking) || isChecking}
            style={{
              backgroundColor: isEligible
                ? BRAND_COLORS.PRIMARY
                : `${BRAND_COLORS.TEXT_SECONDARY}20`,
              paddingHorizontal: responsivePadding(16),
              paddingVertical: responsivePadding(8),
              borderRadius: responsiveBorderRadius(16),
              minWidth: responsiveSize(100),
              alignItems: "center",
              shadowColor: isEligible ? BRAND_COLORS.PRIMARY : "transparent",
              shadowOffset: { width: 0, height: responsiveSize(2) },
              shadowOpacity: 0.2,
              shadowRadius: responsiveSize(4),
              elevation: isEligible ? 4 : 0,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {isChecking && (
                <Feather
                  name="loader"
                  size={responsiveIconSize(12)}
                  color={BRAND_COLORS.SURFACE}
                  style={{ marginRight: responsiveMargin(6) }}
                />
              )}
              <Text
                style={{
                  color: isEligible
                    ? BRAND_COLORS.SURFACE
                    : BRAND_COLORS.TEXT_SECONDARY,
                  fontSize: responsiveFontSize(12),
                  fontWeight: "600",
                }}
              >
                {isChecking
                  ? "Verifying..."
                  : isEligible
                    ? "Request"
                    : "Complete"}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Compact Progress Bar */}
      <View
        style={{
          backgroundColor: `${BRAND_COLORS.PRIMARY}10`,
          height: responsiveSize(6),
          borderRadius: responsiveBorderRadius(3),
          overflow: "hidden",
          marginBottom: responsiveMargin(8),
        }}
      >
        <Animated.View style={[progressAnimatedStyle]}>
          <LinearGradient
            colors={[BRAND_COLORS.PRIMARY, BRAND_COLORS.PRIMARY_LIGHT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              height: "100%",
              width: "100%",
              borderRadius: responsiveBorderRadius(3),
            }}
          />
        </Animated.View>
      </View>

      {/* Progress and Requirements Row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontSize: responsiveFontSize(12),
            color: BRAND_COLORS.TEXT_SECONDARY,
            fontWeight: "500",
          }}
        >
          {progress}% Complete
        </Text>

        {missingRequirements.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: `${BRAND_COLORS.ACCENT_YELLOW}08`,
              paddingHorizontal: responsivePadding(8),
              paddingVertical: responsivePadding(4),
              borderRadius: responsiveBorderRadius(8),
              borderWidth: 1,
              borderColor: `${BRAND_COLORS.ACCENT_YELLOW}15`,
            }}
          >
            <Feather
              name="alert-circle"
              size={responsiveIconSize(12)}
              color={BRAND_COLORS.ACCENT_YELLOW}
              style={{ marginRight: responsiveMargin(4) }}
            />
            <Text
              style={{
                fontSize: responsiveFontSize(11),
                color: BRAND_COLORS.ACCENT_YELLOW,
                fontWeight: "600",
              }}
            >
              {missingRequirements.length} missing
            </Text>
          </View>
        )}
      </View>

      {/* Show requirements only if not eligible and there are missing items */}
      {!isEligible &&
        missingRequirements.length > 0 &&
        missingRequirements.length <= 2 && (
          <Animated.View
            style={{
              marginTop: responsiveMargin(12),
              paddingTop: responsivePadding(12),
              borderTopWidth: 1,
              borderTopColor: `${BRAND_COLORS.BORDER_LIGHT}30`,
              opacity: containerOpacity.value,
              transform: [
                {
                  translateY: interpolate(
                    containerOpacity.value,
                    [0, 1],
                    [10, 0]
                  ),
                },
              ],
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(12),
                color: BRAND_COLORS.TEXT_SECONDARY,
                fontWeight: "500",
                marginBottom: responsiveMargin(6),
              }}
            >
              Still needed:
            </Text>
            {missingRequirements.slice(0, 2).map((requirement, index) => (
              <Text
                key={index}
                style={{
                  fontSize: responsiveFontSize(12),
                  color: BRAND_COLORS.TEXT_SECONDARY,
                  marginBottom: responsiveMargin(2),
                  paddingLeft: responsivePadding(8),
                }}
              >
                • {requirement}
              </Text>
            ))}
          </Animated.View>
        )}
    </Animated.View>
  );
};

export default VerificationProgress;
