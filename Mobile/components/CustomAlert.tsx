import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  runOnJS,
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
import { Feather } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface AlertButton {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
}

export interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
  type?: "default" | "success" | "error" | "warning" | "info";
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: "OK" }],
  onDismiss,
  type = "default",
}) => {
  // Animation values
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  const modalTranslateY = useSharedValue(50);
  const backdropOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const iconRotation = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Show animations
      backdropOpacity.value = withTiming(1, { duration: 300 });
      modalOpacity.value = withTiming(1, { duration: 400 });
      modalScale.value = withSpring(1, { damping: 15, stiffness: 100 });
      modalTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      
      // Icon animations
      iconScale.value = withDelay(200, withSpring(1, { damping: 20 }));
      iconRotation.value = withDelay(200, withSpring(360, { duration: 600 }));
    } else {
      // Hide animations
      backdropOpacity.value = withTiming(0, { duration: 200 });
      modalOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0.8, { duration: 200 });
      modalTranslateY.value = withTiming(50, { duration: 200 });
      iconScale.value = withTiming(0, { duration: 150 });
      iconRotation.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [
      { scale: modalScale.value },
      { translateY: modalTranslateY.value },
    ],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotation.value}deg` },
    ],
  }));

  // Get type-specific styles
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          icon: "check-circle",
          iconColor: BRAND_COLORS.SUCCESS || "#10B981",
          borderColor: BRAND_COLORS.SUCCESS || "#10B981",
          backgroundColor: `${BRAND_COLORS.SUCCESS || "#10B981"}08`,
        };
      case "error":
        return {
          icon: "alert-circle",
          iconColor: BRAND_COLORS.DANGER,
          borderColor: BRAND_COLORS.DANGER,
          backgroundColor: `${BRAND_COLORS.DANGER}08`,
        };
      case "warning":
        return {
          icon: "alert-triangle",
          iconColor: BRAND_COLORS.ACCENT_YELLOW || "#F59E0B",
          borderColor: BRAND_COLORS.ACCENT_YELLOW || "#F59E0B",
          backgroundColor: `${BRAND_COLORS.ACCENT_YELLOW || "#F59E0B"}08`,
        };
      case "info":
        return {
          icon: "info",
          iconColor: BRAND_COLORS.PRIMARY,
          borderColor: BRAND_COLORS.PRIMARY,
          backgroundColor: `${BRAND_COLORS.PRIMARY}08`,
        };
      default:
        return {
          icon: "message-circle",
          iconColor: BRAND_COLORS.PRIMARY,
          borderColor: BRAND_COLORS.PRIMARY,
          backgroundColor: `${BRAND_COLORS.PRIMARY}08`,
        };
    }
  };

  const typeStyles = getTypeStyles();

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleBackdropPress = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
          },
          backdropAnimatedStyle,
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1, width: "100%" }}
          activeOpacity={1}
          onPress={handleBackdropPress}
        >
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            {/* Alert Modal */}
            <Animated.View style={modalAnimatedStyle}>
              <BlurView
                intensity={15}
                tint="light"
                style={{
                  borderRadius: responsiveBorderRadius(24),
                  overflow: "hidden",
                  shadowColor: BRAND_COLORS.PRIMARY,
                  shadowOffset: { width: 0, height: responsiveSize(8) },
                  shadowOpacity: 0.2,
                  shadowRadius: responsiveSize(16),
                  elevation: 16,
                }}
              >
                <LinearGradient
                  colors={[
                    `${BRAND_COLORS.SURFACE}98`,
                    `${BRAND_COLORS.SURFACE}90`,
                  ]}
                  style={{
                    padding: responsivePadding(32),
                    minWidth: responsiveSize(280),
                    maxWidth: responsiveSize(320),
                  }}
                >
                  {/* Animated Border */}
                  <Animated.View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: responsiveSize(3),
                      backgroundColor: typeStyles.borderColor,
                      borderRadius: responsiveBorderRadius(1.5),
                    }}
                  />

                  {/* Icon */}
                  <View
                    style={{
                      alignItems: "center",
                      marginBottom: responsiveMargin(20),
                    }}
                  >
                    <View
                      style={{
                        width: responsiveSize(60),
                        height: responsiveSize(60),
                        borderRadius: responsiveBorderRadius(30),
                        backgroundColor: typeStyles.backgroundColor,
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 2,
                        borderColor: `${typeStyles.borderColor}20`,
                      }}
                    >
                      <Animated.View style={iconAnimatedStyle}>
                        <Feather
                          name={typeStyles.icon as any}
                          size={responsiveIconSize(28)}
                          color={typeStyles.iconColor}
                        />
                      </Animated.View>
                    </View>
                  </View>

                  {/* Title */}
                  <Text
                    style={{
                      fontSize: responsiveFontSize(20),
                      fontWeight: "700",
                      color: BRAND_COLORS.TEXT_PRIMARY,
                      textAlign: "center",
                      marginBottom: responsiveMargin(12),
                      letterSpacing: 0.5,
                    }}
                  >
                    {title}
                  </Text>

                  {/* Message */}
                  <Text
                    style={{
                      fontSize: responsiveFontSize(16),
                      color: BRAND_COLORS.TEXT_SECONDARY,
                      textAlign: "center",
                      marginBottom: responsiveMargin(24),
                      lineHeight: responsiveSize(22),
                      letterSpacing: 0.3,
                    }}
                  >
                    {message}
                  </Text>

                  {/* Buttons */}
                  <View
                    style={{
                      flexDirection: buttons.length > 2 ? "column" : "row",
                      justifyContent: "space-between",
                      gap: responsiveMargin(12),
                    }}
                  >
                    {buttons.map((button, index) => (
                      <TouchableOpacity
                        key={index}
                        style={{
                          flex: buttons.length > 2 ? 1 : undefined,
                          paddingHorizontal: responsivePadding(24),
                          paddingVertical: responsivePadding(14),
                          borderRadius: responsiveBorderRadius(20),
                          backgroundColor:
                            button.style === "destructive"
                              ? BRAND_COLORS.DANGER
                              : button.style === "cancel"
                              ? `${BRAND_COLORS.TEXT_SECONDARY}15`
                              : BRAND_COLORS.PRIMARY,
                          borderWidth: 2,
                          borderColor:
                            button.style === "destructive"
                              ? BRAND_COLORS.DANGER
                              : button.style === "cancel"
                              ? `${BRAND_COLORS.TEXT_SECONDARY}30`
                              : BRAND_COLORS.PRIMARY,
                          shadowColor:
                            button.style === "destructive"
                              ? BRAND_COLORS.DANGER
                              : BRAND_COLORS.PRIMARY,
                          shadowOffset: { width: 0, height: responsiveSize(4) },
                          shadowOpacity: 0.3,
                          shadowRadius: responsiveSize(8),
                          elevation: 6,
                        }}
                        onPress={() => handleButtonPress(button)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={{
                            color:
                              button.style === "cancel"
                                ? BRAND_COLORS.TEXT_PRIMARY
                                : BRAND_COLORS.SURFACE,
                            fontSize: responsiveFontSize(16),
                            fontWeight: "600",
                            textAlign: "center",
                            letterSpacing: 0.3,
                          }}
                        >
                          {button.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </LinearGradient>
              </BlurView>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

export default CustomAlert;
