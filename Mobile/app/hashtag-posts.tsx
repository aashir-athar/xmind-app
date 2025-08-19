import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AntDesign, Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  withDelay,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { BRAND_COLORS, HEADER_CONFIG } from "@/constants/colors";
import PostsList from "@/components/PostsList";
import { useSearch } from "@/hooks/useSearch";
import { 
  responsiveSize, 
  responsivePadding, 
  responsiveMargin, 
  responsiveBorderRadius, 
  responsiveFontSize, 
  responsiveIconSize,
  baseScale 
} from "@/utils/responsive";
import { formatNumber } from "@/utils/formatter";

const { width, height } = Dimensions.get("window");
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const HashtagPostsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hashtag } = useLocalSearchParams<{ hashtag: string }>();
  const { getPostsByHashtag } = useSearch();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const hashtagPosts = getPostsByHashtag(hashtag || "");

  // Animation values
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const backgroundOpacity = useSharedValue(0);

  useEffect(() => {
    // Entrance animations
    headerOpacity.value = withTiming(1, { duration: 400 });
    backgroundOpacity.value = withDelay(200, withTiming(0.1, { duration: 600 }));
    contentOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    // Header stays fixed, no scroll effects
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [
      {
        translateY: interpolate(contentOpacity.value, [0, 1], [20 * baseScale, 0]),
      },
    ],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Add a small delay to show refresh animation
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: BRAND_COLORS.BACKGROUND }}>
      {/* Dynamic Background */}
      <Animated.View style={[backgroundAnimatedStyle, { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }]}>
        <LinearGradient
          colors={[`${BRAND_COLORS.PRIMARY}05`, BRAND_COLORS.BACKGROUND]}
          style={{ flex: 1 }}
        />
      </Animated.View>

      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Enhanced Header */}
        <Animated.View style={headerAnimatedStyle}>
          <BlurView
            intensity={HEADER_CONFIG.BLUR_INTENSITY}
            tint="light"
            style={{ 
              paddingHorizontal: responsivePadding(HEADER_CONFIG.PADDING_HORIZONTAL), 
              paddingVertical: responsivePadding(HEADER_CONFIG.PADDING_VERTICAL),
              paddingTop: responsivePadding(HEADER_CONFIG.PADDING_VERTICAL + 8) // Extra padding for status bar
            }}
          >
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={handleBackPress}
                style={{
                  width: responsiveSize(HEADER_CONFIG.BUTTON_SIZE),
                  height: responsiveSize(HEADER_CONFIG.BUTTON_SIZE),
                  borderRadius: responsiveBorderRadius(HEADER_CONFIG.BUTTON_BORDER_RADIUS),
                  backgroundColor: `${BRAND_COLORS.PRIMARY}15`,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: BRAND_COLORS.PRIMARY,
                  shadowOffset: { width: 0, height: responsiveSize(2) },
                  shadowOpacity: 0.1,
                  shadowRadius: responsiveSize(4),
                  elevation: 2,
                }}
              >
                <AntDesign
                  name="arrowleft"
                  size={responsiveIconSize(HEADER_CONFIG.ICON_SIZE)}
                  color={BRAND_COLORS.PRIMARY}
                />
              </TouchableOpacity>
              
              <View className="flex-1 items-center">
                <Text
                  style={{
                    fontSize: responsiveFontSize(HEADER_CONFIG.TITLE_SIZE),
                    fontWeight: "800",
                    color: BRAND_COLORS.PRIMARY,
                    letterSpacing: 0.5,
                  }}
                >
                  {hashtag}
                </Text>
                <Text
                  style={{
                    fontSize: responsiveFontSize(HEADER_CONFIG.SUBTITLE_SIZE),
                    color: BRAND_COLORS.TEXT_SECONDARY,
                    fontWeight: "500",
                    marginTop: responsiveMargin(HEADER_CONFIG.TITLE_MARGIN_BOTTOM),
                  }}
                >
                  {formatNumber(hashtagPosts.length)} {hashtagPosts.length === 1 ? "post" : "posts"}
                </Text>
              </View>
              
              <View style={{ width: responsiveSize(HEADER_CONFIG.BUTTON_SIZE) }} />
            </View>
          </BlurView>
        </Animated.View>

        {/* Posts List */}
        <AnimatedScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: responsiveSize(120) + insets.bottom }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={BRAND_COLORS.PRIMARY}
              colors={[BRAND_COLORS.PRIMARY]}
            />
          }
        >
          <Animated.View style={contentAnimatedStyle}>
            {hashtagPosts.length > 0 ? (
              <View
                style={{
                  backgroundColor: BRAND_COLORS.SURFACE,
                  marginHorizontal: responsiveMargin(12),
                  borderRadius: responsiveBorderRadius(24),
                  marginTop: responsiveMargin(8),
                  shadowColor: BRAND_COLORS.PRIMARY,
                  shadowOffset: { width: 0, height: responsiveSize(4) },
                  shadowOpacity: 0.08,
                  shadowRadius: responsiveSize(12),
                  elevation: 8,
                  overflow: "hidden",
                }}
              >
                <PostsList posts={hashtagPosts} username={undefined} />
              </View>
            ) : (
              <View 
                className="flex-1 justify-center items-center py-20"
                style={{
                  backgroundColor: BRAND_COLORS.SURFACE,
                  marginHorizontal: responsiveMargin(12),
                  borderRadius: responsiveBorderRadius(24),
                  marginTop: responsiveMargin(8),
                  shadowColor: BRAND_COLORS.PRIMARY,
                  shadowOffset: { width: 0, height: responsiveSize(4) },
                  shadowOpacity: 0.08,
                  shadowRadius: responsiveSize(12),
                  elevation: 8,
                }}
              >
                <View
                  style={{
                    width: responsiveSize(80),
                    height: responsiveSize(80),
                    borderRadius: responsiveBorderRadius(40),
                    backgroundColor: `${BRAND_COLORS.PRIMARY}15`,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: responsiveMargin(16),
                  }}
                >
                  <Feather
                    name="hash"
                    size={responsiveIconSize(40)}
                    color={BRAND_COLORS.PRIMARY}
                  />
                </View>
                <Text 
                  style={{
                    fontSize: responsiveFontSize(20),
                    fontWeight: "700",
                    color: BRAND_COLORS.TEXT_PRIMARY,
                    marginBottom: responsiveMargin(8),
                  }}
                >
                  No posts found
                </Text>
                <Text 
                  style={{
                    fontSize: responsiveFontSize(16),
                    color: BRAND_COLORS.TEXT_SECONDARY,
                    textAlign: "center",
                    paddingHorizontal: responsivePadding(32),
                    lineHeight: responsiveSize(24),
                  }}
                >
                  No posts contain the hashtag {hashtag}. Try searching for a different hashtag or check back later.
                </Text>
              </View>
            )}
          </Animated.View>
        </AnimatedScrollView>
      </SafeAreaView>
    </View>
  );
};

export default HashtagPostsScreen;
