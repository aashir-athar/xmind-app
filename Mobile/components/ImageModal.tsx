import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
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

const { width, height } = Dimensions.get("window");

interface ImageModalProps {
  isVisible: boolean;
  onClose: () => void;
  imageUrl: string;
  imageTitle?: string;
}

const ImageModal = ({
  imageUrl,
  imageTitle,
  isVisible,
  onClose,
}: ImageModalProps) => {
  // Animation values
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.9);
  const headerOpacity = useSharedValue(0);
  const imageOpacity = useSharedValue(0);
  const closeButtonScale = useSharedValue(1);

  useEffect(() => {
    if (isVisible) {
      modalOpacity.value = withTiming(1, { duration: 300 });
      modalScale.value = withSpring(1, { damping: 15 });
      headerOpacity.value = withDelay(150, withTiming(1, { duration: 200 }));
      imageOpacity.value = withDelay(250, withTiming(1, { duration: 400 }));
    } else {
      modalOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0.9, { duration: 200 });
      headerOpacity.value = withTiming(0, { duration: 100 });
      imageOpacity.value = withTiming(0, { duration: 100 });
    }
  }, [isVisible]);

  const handleClose = () => {
    closeButtonScale.value = withSpring(0.95, { damping: 15 }, () => {
      closeButtonScale.value = withSpring(1);
      runOnJS(onClose)();
    });
  };

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      {
        translateY: interpolate(
          headerOpacity.value,
          [0, 1],
          [-10 * baseScale, 0]
        ),
      },
    ],
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
    transform: [
      {
        translateY: interpolate(
          imageOpacity.value,
          [0, 1],
          [20 * baseScale, 0]
        ),
      },
    ],
  }));

  const closeButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: closeButtonScale.value }],
  }));

  return (
    <Modal
      visible={isVisible}
      animationType="none"
      presentationStyle="pageSheet"
      transparent={true}
      style={{ flex: 1 }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: `${BRAND_COLORS.PRIMARY_DARK}40`,
        }}
      >
        <BlurView
          intensity={20}
          tint="dark"
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Animated.View
            style={[
              {
                flex: 1,
                width: width - responsiveSize(32),
                maxHeight: height * 0.8,
                borderRadius: responsiveBorderRadius(28),
                overflow: "hidden",
                shadowColor: BRAND_COLORS.PRIMARY,
                shadowOffset: { width: 0, height: responsiveSize(20) },
                shadowOpacity: 0.3,
                shadowRadius: responsiveSize(30),
                elevation: 20,
              },
              modalAnimatedStyle,
            ]}
          >
            <LinearGradient
              colors={[BRAND_COLORS.SURFACE, `${BRAND_COLORS.BACKGROUND}95`]}
              style={{ flex: 1 }}
            >
              {/* Enhanced Header */}
              <Animated.View style={headerAnimatedStyle}>
                <BlurView
                  intensity={10}
                  tint="light"
                  style={{
                    paddingHorizontal: responsivePadding(24),
                    paddingVertical: responsivePadding(20),
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <Animated.View style={closeButtonAnimatedStyle}>
                      <TouchableOpacity
                        onPress={handleClose}
                        style={{
                          paddingHorizontal: responsivePadding(16),
                          paddingVertical: responsivePadding(8),
                          borderRadius: responsiveBorderRadius(20),
                          backgroundColor: `${BRAND_COLORS.BORDER_LIGHT}20`,
                        }}
                      >
                        <Text
                          style={{
                            color: BRAND_COLORS.TEXT_SECONDARY,
                            fontSize: responsiveFontSize(16),
                            fontWeight: "600",
                          }}
                        >
                          Close
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>

                    <View
                      style={{
                        paddingHorizontal: responsivePadding(20),
                        paddingVertical: responsivePadding(8),
                        borderRadius: responsiveBorderRadius(20),
                        backgroundColor: `${BRAND_COLORS.PRIMARY}15`,
                      }}
                    >
                      <Text
                        style={{
                          color: BRAND_COLORS.PRIMARY,
                          fontSize: responsiveFontSize(18),
                          fontWeight: "700",
                          textAlign: "center",
                        }}
                      >
                        {imageTitle || "Image View"}
                      </Text>
                    </View>

                    <View style={{ width: responsiveSize(80) }} />
                  </View>
                </BlurView>
              </Animated.View>

              {/* Image Content */}
              <Animated.View
                style={[
                  imageAnimatedStyle,
                  { flex: 1, padding: responsivePadding(24) },
                ]}
              >
                <View
                  style={{
                    flex: 1,
                    borderRadius: responsiveBorderRadius(20),
                    overflow: "hidden",
                    backgroundColor: BRAND_COLORS.BACKGROUND,
                    shadowColor: BRAND_COLORS.PRIMARY,
                    shadowOffset: { width: 0, height: responsiveSize(8) },
                    shadowOpacity: 0.1,
                    shadowRadius: responsiveSize(16),
                    elevation: 8,
                  }}
                >
                  <Image
                    source={{ uri: imageUrl }}
                    resizeMode="contain"
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </View>
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </BlurView>
      </View>
    </Modal>
  );
};

export default ImageModal;
