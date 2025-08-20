import {
  View,
  Text,
  Image,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import SignOutButton from "@/components/SignOutButton";
import { useUserSync } from "@/hooks/useUserSync";
import { Ionicons, Feather } from "@expo/vector-icons";
import PostComposer from "@/components/PostComposer";
import PostsList from "@/components/PostsList";
import { useFeedRanking } from "@/hooks/useFeedRanking";
import CustomLoading from "@/components/CustomLoading";
import { BRAND_COLORS, HEADER_CONFIG } from "@/constants/colors";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";
import { 
  responsiveSize, 
  responsivePadding, 
  responsiveMargin, 
  responsiveBorderRadius, 
  responsiveFontSize, 
  responsiveIconSize,
  baseScale,
} from "@/utils/responsive";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const HomeScreen = () => {
  const {
    showSuccess,
    showError,
    showInfo,
    alertConfig,
    isVisible,
    hideAlert,
  } = useCustomAlert();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    posts: rankedPosts,
    isLoading,
    error,
    refetch: refetchPosts,
    feedStats,
  } = useFeedRanking({
    useAdvancedAlgorithm: true,
    maxPosts: 25,
    customWeights: {
      engagementLikelihood: 0.4,
      recency: 0.3,
      connectionStrength: 0.15,
      diversity: 0.1,
      quality: 0.05,
    },
  });

  // Debug logging
  useEffect(() => {
    if (rankedPosts && rankedPosts.length > 0) {
      console.log(`Feed ranking: ${rankedPosts.length} posts loaded`);
      console.log("Feed stats:", feedStats);
    }
  }, [rankedPosts, feedStats]);

  // Animation values
  const headerOpacity = useSharedValue(1);
  const headerScale = useSharedValue(1);
  const scrollY = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const gradientProgress = useSharedValue(0);

  useEffect(() => {
    // Entrance animation
    headerScale.value = withSpring(1, { damping: 15 });
    logoRotation.value = withSpring(360, { duration: 1000 });
    gradientProgress.value = withTiming(1, { duration: 2000 });
  }, []);

  const handlePullToRefresh = async () => {
    setIsRefreshing(true);
    headerScale.value = withSpring(0.95);

    try {
    await refetchPosts();
    } catch (error) {
      console.error("Failed to refresh feed:", error);
    } finally {
    setIsRefreshing(false);
    headerScale.value = withSpring(1);
    }
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${logoRotation.value}deg` }],
  }));

  const backgroundGradientStyle = useAnimatedStyle(() => ({
    opacity: interpolate(gradientProgress.value, [0, 1], [0, 0.1]),
  }));

  useUserSync();

  // Show loading state
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: BRAND_COLORS.BACKGROUND,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CustomLoading
          message="Loading your feed..."
          size="large"
          variant="screen"
          intensity={8}
          colors={[`${BRAND_COLORS.PRIMARY}05`, `${BRAND_COLORS.SURFACE}95`]}
          showDots={true}
          accessibilityLabel="Custom loading spinner"
        />
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: BRAND_COLORS.BACKGROUND,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: responsiveSize(80),
            height: responsiveSize(80),
            borderRadius: responsiveBorderRadius(40),
            backgroundColor: `${BRAND_COLORS.DANGER}15`,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: responsiveMargin(16),
          }}
        >
          <Feather
            name="alert-circle"
            size={responsiveIconSize(40)}
            color={BRAND_COLORS.DANGER}
          />
        </View>
        <Text
          style={{
            color: BRAND_COLORS.TEXT_SECONDARY,
            marginBottom: responsiveMargin(16),
            fontSize: responsiveFontSize(16),
            textAlign: "center",
          }}
        >
          Failed to load feed
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: BRAND_COLORS.PRIMARY,
            paddingHorizontal: responsivePadding(24),
            paddingVertical: responsivePadding(12),
            borderRadius: responsiveBorderRadius(20),
            shadowColor: BRAND_COLORS.PRIMARY,
            shadowOffset: { width: 0, height: responsiveSize(4) },
            shadowOpacity: 0.3,
            shadowRadius: responsiveSize(8),
            elevation: 6,
          }}
          onPress={() => refetchPosts()}
        >
          <Text
            style={{
              color: BRAND_COLORS.SURFACE,
              fontSize: responsiveFontSize(16),
              fontWeight: "700",
              letterSpacing: 0.3,
            }}
          >
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: BRAND_COLORS.BACKGROUND }}
    >
      {/* Dynamic Background Gradient */}
      <Animated.View
        style={[
          { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
          backgroundGradientStyle,
        ]}
      >
        <LinearGradient
          colors={[BRAND_COLORS.PRIMARY, BRAND_COLORS.BACKGROUND]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>

      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        {/* Enhanced Header with Blur Effect */}
        <Animated.View style={headerAnimatedStyle}>
          <BlurView
            intensity={HEADER_CONFIG.BLUR_INTENSITY}
            tint="light"
            style={{ 
              paddingHorizontal: responsivePadding(
                HEADER_CONFIG.PADDING_HORIZONTAL
              ),
              paddingVertical: responsivePadding(
                HEADER_CONFIG.PADDING_VERTICAL
              ),
              paddingTop: responsivePadding(HEADER_CONFIG.PADDING_VERTICAL + 8), // Extra padding for status bar
            }}
          >
            <View className="flex-row justify-between items-center">
              <Animated.View style={logoAnimatedStyle}>
                <View
                  style={{
                    width: responsiveSize(HEADER_CONFIG.BUTTON_SIZE),
                    height: responsiveSize(HEADER_CONFIG.BUTTON_SIZE),
                    borderRadius: responsiveBorderRadius(
                      HEADER_CONFIG.BUTTON_BORDER_RADIUS
                    ),
                    backgroundColor: BRAND_COLORS.PRIMARY,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: BRAND_COLORS.PRIMARY,
                    shadowOffset: { width: 0, height: responsiveSize(4) },
                    shadowOpacity: 0.3,
                    shadowRadius: responsiveSize(8),
                    elevation: 8,
                  }}
                >
                  <Image
                    source={require("@/assets/images/xMind-Logo1.png")}
                    style={{ 
                      width: responsiveSize(HEADER_CONFIG.ICON_SIZE),
                      height: responsiveSize(HEADER_CONFIG.ICON_SIZE),
                    }}
                    resizeMode="contain"
                  />
                </View>
              </Animated.View>

              <View
                style={{
                  paddingHorizontal: responsivePadding(20),
                  paddingVertical: responsivePadding(8),
                  borderRadius: responsiveBorderRadius(20),
                  borderWidth: 1,
                  borderColor: `${BRAND_COLORS.PRIMARY}20`,
                }}
              >
                <Text
                  style={{
                    fontSize: responsiveFontSize(HEADER_CONFIG.TITLE_SIZE),
                    fontWeight: "800",
                    color: BRAND_COLORS.TEXT_PRIMARY,
                    letterSpacing: 0.5,
                  }}
                >
                  xMind
                </Text>
              </View>

              <SignOutButton />
            </View>
          </BlurView>
        </Animated.View>

        {/* Enhanced ScrollView with Smooth Animations */}
        <AnimatedScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: responsiveSize(100) }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handlePullToRefresh}
              tintColor={BRAND_COLORS.PRIMARY_LIGHT}
              title="Syncing your mind..."
              titleColor={BRAND_COLORS.TEXT_SECONDARY}
              progressBackgroundColor={BRAND_COLORS.SURFACE}
              colors={[BRAND_COLORS.PRIMARY, BRAND_COLORS.PRIMARY_LIGHT]}
            />
          }
        >
          <PostComposer />
          {rankedPosts && rankedPosts.length > 0 ? (
            <PostsList posts={rankedPosts} />
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: responsivePadding(40),
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
                  name="feather"
                  size={responsiveIconSize(40)}
                  color={BRAND_COLORS.PRIMARY}
                />
              </View>
              <Text
                style={{
                  fontSize: responsiveFontSize(18),
                  fontWeight: "700",
                  color: BRAND_COLORS.TEXT_PRIMARY,
                  marginBottom: responsiveMargin(8),
                  textAlign: "center",
                }}
              >
                No posts yet
              </Text>
              <Text
                style={{
                  fontSize: responsiveFontSize(14),
                  color: BRAND_COLORS.TEXT_SECONDARY,
                  textAlign: "center",
                  paddingHorizontal: responsivePadding(32),
                  lineHeight: responsiveSize(20),
                }}
              >
                Be the first to share your thoughts! Create a post to get
                started.
              </Text>
            </View>
          )}
        </AnimatedScrollView>

        {/* Floating Action Indicator */}
        <Animated.View
          style={{
            position: "absolute",
            bottom: responsiveSize(100),
            right: responsiveSize(20),
            width: responsiveSize(4),
            height: responsiveSize(40),
            borderRadius: responsiveBorderRadius(2),
            backgroundColor: BRAND_COLORS.PRIMARY,
            opacity: 0.6,
          }}
        />

        {/* Custom Alert */}
        {alertConfig && (
          <CustomAlert
            visible={isVisible}
            title={alertConfig.title}
            message={alertConfig.message}
            buttons={alertConfig.buttons}
            type={alertConfig.type}
            onDismiss={hideAlert}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

export default HomeScreen;
