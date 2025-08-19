import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  interpolateColor,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useCreatePost } from "@/hooks/useCreatePost";
import { useUser } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
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

const { width } = Dimensions.get("window");

const PostComposer = () => {
  const {
    content,
    setContent,
    selectedImage,
    isCreating,
    pickImageFromGallery,
    takePhoto,
    removeImage,
    createPost,
  } = useCreatePost();

  const { user } = useUser();
  const [isFocused, setIsFocused] = useState(false);

  // Animation values
  const containerScale = useSharedValue(1);
  const inputHeight = useSharedValue(60 * baseScale);
  const borderRadius = useSharedValue(20 * baseScale);
  const shadowOpacity = useSharedValue(0.1);
  const buttonScale = useSharedValue(1);
  const progressWidth = useSharedValue(0);
  const avatarScale = useSharedValue(1);
  const toolsOpacity = useSharedValue(1);

  useEffect(() => {
    // Entrance animation
    containerScale.value = withSpring(1, { damping: 15 });
    avatarScale.value = withSpring(1, { damping: 20 });
  }, []);

  useEffect(() => {
    if (isFocused) {
      inputHeight.value = withSpring(120 * baseScale);
      borderRadius.value = withSpring(24 * baseScale);
      shadowOpacity.value = withTiming(0.15);
      avatarScale.value = withSpring(1.05);
      toolsOpacity.value = withTiming(1);
    } else {
      inputHeight.value = withSpring(60 * baseScale);
      borderRadius.value = withSpring(20 * baseScale);
      shadowOpacity.value = withTiming(0.08);
      avatarScale.value = withSpring(1);
    }
  }, [isFocused]);

  useEffect(() => {
    const progress = content.length / 300;
    progressWidth.value = withTiming(progress * (width - 32 * baseScale));
  }, [content]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
    shadowOpacity: shadowOpacity.value,
  }));

  const inputContainerAnimatedStyle = useAnimatedStyle(() => ({
    minHeight: inputHeight.value,
    borderRadius: borderRadius.value,
  }));

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    backgroundColor: interpolateColor(
      content.trim().length + (selectedImage ? 1 : 0),
      [0, 1],
      [BRAND_COLORS.SURFACE_MUTED, BRAND_COLORS.PRIMARY]
    ),
    borderRadius: borderRadius.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
    backgroundColor: interpolateColor(
      content.length / 300,
      [0, 0.7, 0.9, 1],
      [
        BRAND_COLORS.SUCCESS,
        BRAND_COLORS.SUCCESS,
        BRAND_COLORS.WARNING,
        BRAND_COLORS.DANGER,
      ]
    ),
  }));

  const toolsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: toolsOpacity.value,
  }));

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleButtonPress = () => {
    buttonScale.value = withSpring(0.95, { damping: 15 }, () => {
      buttonScale.value = withSpring(1);
      runOnJS(createPost)();
    });
  };

  return (
    <Animated.View
      style={[
        {
          marginHorizontal: responsiveMargin(16),
          marginVertical: responsiveMargin(12),
          shadowColor: BRAND_COLORS.PRIMARY,
          shadowOffset: { width: 0, height: responsiveSize(8) },
          shadowRadius: responsiveSize(16),
          elevation: 12,
        },
        containerAnimatedStyle,
      ]}
    >
      <BlurView
        intensity={10}
        tint="light"
        style={{ borderRadius: responsiveBorderRadius(24), overflow: "hidden" }}
      >
        <LinearGradient
          colors={[`${BRAND_COLORS.SURFACE}95`, `${BRAND_COLORS.SURFACE}85`]}
          style={{ padding: responsivePadding(20) }}
        >
          <View className="flex-row">
            <Animated.View style={avatarAnimatedStyle}>
              <View
                style={{
                  width: responsiveSize(52),
                  height: responsiveSize(52),
                  borderRadius: responsiveBorderRadius(100),
                  marginRight: responsiveMargin(16),
                  overflow: "hidden",
                  borderWidth: 2,
                  borderColor: `${BRAND_COLORS.PRIMARY}20`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={{ uri: user?.imageUrl }}
                  style={{ width: responsiveSize(52), height: responsiveSize(52) }}
                  resizeMode="cover"
                />
              </View>
            </Animated.View>

            <View className="flex-1">
              <Animated.View
                style={[
                  {
                    backgroundColor: `${BRAND_COLORS.BACKGROUND}40`,
                    borderWidth: 1,
                    borderColor: isFocused
                      ? BRAND_COLORS.PRIMARY_LIGHT
                      : `${BRAND_COLORS.BORDER_LIGHT}60`,
                    paddingHorizontal: responsivePadding(16),
                    paddingVertical: responsivePadding(12),
                  },
                  inputContainerAnimatedStyle,
                ]}
              >
                <TextInput
                  style={{
                    fontSize: responsiveFontSize(16),
                    lineHeight: responsiveSize(22),
                    color: BRAND_COLORS.TEXT_PRIMARY,
                    flex: 1,
                    textAlignVertical: "top",
                  }}
                  placeholder="What's crossing your mind?"
                  placeholderTextColor={BRAND_COLORS.PLACEHOLDER}
                  multiline
                  value={content}
                  onChangeText={setContent}
                  maxLength={300}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </Animated.View>

              {/* Character Progress Bar */}
              {content.length > 0 && (
                <View
                  style={{
                    height: responsiveSize(3),
                    backgroundColor: `${BRAND_COLORS.BORDER_LIGHT}30`,
                    borderRadius: responsiveBorderRadius(2),
                    marginTop: responsiveMargin(12),
                    overflow: "hidden",
                  }}
                >
                  <Animated.View
                    style={[
                      { height: "100%", borderRadius: responsiveBorderRadius(2) },
                      progressAnimatedStyle,
                    ]}
                  />
                </View>
              )}
            </View>
          </View>

          {selectedImage && (
            <Animated.View
              style={{
                marginTop: responsiveMargin(16),
                marginLeft: responsiveMargin(68),
                borderRadius: responsiveBorderRadius(16),
                overflow: "hidden",
                shadowColor: BRAND_COLORS.PRIMARY,
                shadowOffset: { width: 0, height: responsiveSize(4) },
                shadowOpacity: 0.1,
                shadowRadius: responsiveSize(8),
                elevation: 4,
              }}
            >
              <Image
                source={{ uri: selectedImage }}
                style={{ width: "100%", height: responsiveSize(200) }}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: responsiveSize(12),
                  right: responsiveSize(12),
                  width: responsiveSize(32),
                  height: responsiveSize(32),
                  borderRadius: responsiveBorderRadius(16),
                  backgroundColor: `${BRAND_COLORS.SURFACE}90`,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={removeImage}
              >
                <Feather name="x" size={responsiveIconSize(16)} color={BRAND_COLORS.TEXT_PRIMARY} />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Enhanced Action Bar */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: responsiveMargin(20),
            }}
          >
            <Animated.View
              style={[
                { flexDirection: "row", alignItems: "center" },
                toolsAnimatedStyle,
              ]}
            >
              <TouchableOpacity
                style={{
                  width: responsiveSize(44),
                  height: responsiveSize(44),
                  borderRadius: responsiveBorderRadius(22),
                  backgroundColor: `${BRAND_COLORS.PRIMARY}10`,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: responsiveMargin(12),
                }}
                onPress={pickImageFromGallery}
              >
                <Feather name="image" size={responsiveIconSize(20)} color={BRAND_COLORS.PRIMARY} />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  width: responsiveSize(44),
                  height: responsiveSize(44),
                  borderRadius: responsiveBorderRadius(22),
                  backgroundColor: `${BRAND_COLORS.PRIMARY}10`,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: responsiveMargin(12),
                }}
                onPress={takePhoto}
              >
                <Feather name="camera" size={responsiveIconSize(20)} color={BRAND_COLORS.PRIMARY} />
              </TouchableOpacity>

              {/* Character Counter */}
              {content.length > 250 && (
                <View
                  style={{
                    paddingHorizontal: responsivePadding(12),
                    paddingVertical: responsivePadding(6),
                    borderRadius: responsiveBorderRadius(12),
                    backgroundColor:
                      content.length >= 290
                        ? `${BRAND_COLORS.DANGER}15`
                        : `${BRAND_COLORS.WARNING}15`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: responsiveFontSize(12),
                      fontWeight: "600",
                      color:
                        content.length >= 290
                          ? BRAND_COLORS.DANGER
                          : BRAND_COLORS.WARNING,
                    }}
                  >
                    {300 - content.length}
                  </Text>
                </View>
              )}
            </Animated.View>

            <Animated.View style={buttonAnimatedStyle}>
              <TouchableOpacity
                style={{
                  paddingHorizontal: responsivePadding(28),
                  paddingVertical: responsivePadding(12),
                  borderRadius: responsiveBorderRadius(24),
                  shadowColor: BRAND_COLORS.PRIMARY,
                  shadowOffset: { width: 0, height: responsiveSize(4) },
                  shadowOpacity: 0.2,
                  shadowRadius: responsiveSize(8),
                  elevation: 6,
                }}
                onPress={handleButtonPress}
                disabled={isCreating || !(content.trim() || selectedImage)}
              >
                {isCreating ? (
                  <ActivityIndicator
                    size="small"
                    color={BRAND_COLORS.SURFACE}
                  />
                ) : (
                  <Text
                    style={{
                      fontSize: responsiveFontSize(15),
                      fontWeight: "700",
                      color:
                        content.trim() || selectedImage
                          ? BRAND_COLORS.SURFACE
                          : BRAND_COLORS.TEXT_SECONDARY,
                      letterSpacing: 0.5,
                    }}
                  >
                    Share
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

export default PostComposer;
