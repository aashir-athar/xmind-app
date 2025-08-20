import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  withDelay,
  withSequence,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import {
  useSafeAreaInsets,
  SafeAreaView,
} from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import PostsList from "@/components/PostsList";
import { format } from "date-fns";
import { usePosts } from "@/hooks/usePosts";
import { useUserProfile } from "@/hooks/useUserProfile";
import { BRAND_COLORS, HEADER_CONFIG } from "@/constants/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { User } from "@/types";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { 
  responsiveSize, 
  responsivePadding, 
  responsiveMargin, 
  responsiveBorderRadius, 
  responsiveFontSize, 
  responsiveIconSize,
  baseScale,
} from "@/utils/responsive";
import CustomLoading from "@/components/CustomLoading";

const { width, height } = Dimensions.get("window");
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const UserProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userId, username } = useLocalSearchParams<{
    userId: string;
    username: string;
  }>();
  const { currentUser, refetch: refetchCurrentUser } = useCurrentUser();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    user,
    isLoading,
    error,
    refetch: refetchUserProfile,
    toggleFollow,
    isFollowLoading,
  } = useUserProfile(username);

  // Calculate if current user is following this user
  const isFollowing =
    currentUser?.following?.includes(user?._id || "") || false;

  const {
    posts: userPosts,
    refetch: refetchPosts,
    isLoading: isRefetching,
  } = usePosts(username);

  // Animation values
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(0);
  const bannerScale = useSharedValue(0.8);
  const avatarScale = useSharedValue(0);
  const profileInfoOpacity = useSharedValue(0);
  const statsOpacity = useSharedValue(0);
  const followButtonScale = useSharedValue(0);
  const bannerOverlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (!isLoading && user) {
      // Staggered entrance animations
      headerOpacity.value = withTiming(1, { duration: 400 });
      bannerScale.value = withSpring(1, { damping: 15 });
      bannerOverlayOpacity.value = withDelay(
        300,
        withTiming(0.3, { duration: 600 })
      );
      avatarScale.value = withDelay(400, withSpring(1, { damping: 20 }));
      profileInfoOpacity.value = withDelay(
        600,
        withTiming(1, { duration: 500 })
      );
      statsOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));
      followButtonScale.value = withDelay(1000, withSpring(1, { damping: 15 }));
    }
  }, [isLoading, user]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;

      // Dynamic header effects based on scroll
      const progress = Math.min(event.contentOffset.y / 100, 1);
      headerOpacity.value = interpolate(progress, [0, 1], [1, 0.8]);
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      {
        translateY: interpolate(scrollY.value, [0, 100], [0, -10 * baseScale]),
      },
    ],
  }));

  const bannerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: bannerScale.value },
      {
        translateY: interpolate(scrollY.value, [0, 200], [0, -50 * baseScale]),
      },
    ],
  }));

  const bannerOverlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bannerOverlayOpacity.value,
  }));

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: avatarScale.value },
      {
        translateY: interpolate(scrollY.value, [0, 100], [0, -20 * baseScale]),
      },
    ],
  }));

  const profileInfoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: profileInfoOpacity.value,
    transform: [
      {
        translateY: interpolate(
          profileInfoOpacity.value,
          [0, 1],
          [20 * baseScale, 0]
        ),
      },
    ],
  }));

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [
      {
        translateY: interpolate(
          statsOpacity.value,
          [0, 1],
          [15 * baseScale, 0]
        ),
      },
    ],
  }));

  const followButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: followButtonScale.value }],
  }));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchUserProfile(),
      refetchPosts(),
      refetchCurrentUser(),
    ]);
    setIsRefreshing(false);
  };

  const handleFollowToggle = () => {
    if (user && currentUser) {
      toggleFollow(user._id);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  if (isLoading || !user) {
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
          message="Loading profile..."
          size="large"
          variant="screen"
          colors={[`${BRAND_COLORS.PRIMARY}05`, `${BRAND_COLORS.SURFACE}95`]}
          showDots={true}
          accessibilityLabel="Custom loading spinner"
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: BRAND_COLORS.BACKGROUND }}>
      {/* Dynamic Background */}
      <LinearGradient
        colors={[`${BRAND_COLORS.PRIMARY}05`, BRAND_COLORS.BACKGROUND]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        {/* Enhanced Header */}
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
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={handleBackPress}
                style={{
                  width: responsiveSize(HEADER_CONFIG.BUTTON_SIZE),
                  height: responsiveSize(HEADER_CONFIG.BUTTON_SIZE),
                  borderRadius: responsiveBorderRadius(
                    HEADER_CONFIG.BUTTON_BORDER_RADIUS
                  ),
                  backgroundColor: `${BRAND_COLORS.PRIMARY}15`,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <AntDesign
                  name="arrowleft"
                  size={responsiveIconSize(HEADER_CONFIG.ICON_SIZE)}
                  color={BRAND_COLORS.PRIMARY}
                />
              </TouchableOpacity>
              <View className="items-center justify-center">
                <Text
                  style={{
                    fontSize: responsiveFontSize(HEADER_CONFIG.TITLE_SIZE),
                    fontWeight: "800",
                    color: BRAND_COLORS.TEXT_PRIMARY,
                    letterSpacing: 0.5,
                  }}
                >
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text
                  style={{
                    fontSize: responsiveFontSize(HEADER_CONFIG.SUBTITLE_SIZE),
                    color: BRAND_COLORS.TEXT_SECONDARY,
                    fontWeight: "500",
                    marginTop: responsiveMargin(
                      HEADER_CONFIG.TITLE_MARGIN_BOTTOM
                    ),
                  }}
                >
                  {userPosts.length === 0
                    ? "No thoughts yet"
                    : userPosts.length === 1
                      ? "1 Thought"
                      : `${userPosts.length} Thoughts`}
                </Text>
              </View>
              <View
                style={{ width: responsiveSize(HEADER_CONFIG.BUTTON_SIZE) }}
              />
            </View>
          </BlurView>
        </Animated.View>

        <AnimatedScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: responsiveSize(120) + insets.bottom,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={BRAND_COLORS.PRIMARY_LIGHT}
              progressBackgroundColor={BRAND_COLORS.SURFACE}
              colors={[BRAND_COLORS.PRIMARY, BRAND_COLORS.PRIMARY_LIGHT]}
            />
          }
        >
          {/* Enhanced Banner */}
          <Animated.View
            style={[{ position: "relative" }, bannerAnimatedStyle]}
          >
            <Image
              source={
                user?.bannerImage
                  ? { uri: user.bannerImage }
                  : require("../assets/images/default-banner.jpeg")
              }
              style={{ width: "100%", height: responsiveSize(200) }}
              resizeMode="cover"
            />

            {/* Banner Overlay with Gradient */}
            <Animated.View style={[bannerOverlayAnimatedStyle]}>
              <LinearGradient
                colors={[
                  "transparent",
                  `${BRAND_COLORS.PRIMARY}20`,
                  `${BRAND_COLORS.PRIMARY_DARK}40`,
                ]}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
            </Animated.View>
          </Animated.View>

          {/* Enhanced Profile Section */}
          <View
            style={{
              paddingHorizontal: responsivePadding(20),
              paddingBottom: responsivePadding(24),
              backgroundColor: BRAND_COLORS.SURFACE,
              marginHorizontal: responsiveMargin(12),
              marginTop: responsiveMargin(-20),
              borderTopLeftRadius: responsiveBorderRadius(24),
              borderTopRightRadius: responsiveBorderRadius(24),
              shadowColor: BRAND_COLORS.PRIMARY,
              shadowOffset: { width: 0, height: responsiveSize(-4) },
              shadowOpacity: 0.1,
              shadowRadius: responsiveSize(20),
              elevation: 12,
            }}
          >
            <View
              className="flex-row justify-between items-end"
              style={{ 
                marginTop: responsiveMargin(-40), 
                marginBottom: responsiveMargin(20),
              }}
            >
              <Animated.View style={avatarAnimatedStyle}>
                <View
                  style={{
                    width: responsiveSize(120),
                    height: responsiveSize(120),
                    borderRadius: responsiveBorderRadius(60),
                    borderWidth: 4,
                    borderColor: BRAND_COLORS.SURFACE,
                    overflow: "hidden",
                    shadowColor: BRAND_COLORS.PRIMARY,
                    shadowOffset: { width: 0, height: responsiveSize(8) },
                    shadowOpacity: 0.2,
                    shadowRadius: responsiveSize(16),
                    elevation: 10,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={
                      user?.profilePicture
                        ? { uri: user.profilePicture }
                        : require("../assets/images/default-avatar.jpeg")
                    }
                    style={{ 
                      width: responsiveSize(120), 
                      height: responsiveSize(120),
                    }}
                    resizeMode="cover"
                  />
                </View>
              </Animated.View>

              <Animated.View style={followButtonAnimatedStyle}>
                <TouchableOpacity
                  onPress={handleFollowToggle}
                  disabled={isFollowLoading}
                  style={{
                    paddingHorizontal: responsivePadding(24),
                    paddingVertical: responsivePadding(12),
                    borderRadius: responsiveBorderRadius(24),
                    backgroundColor: isFollowing
                      ? `${BRAND_COLORS.SECONDARY}15`
                      : BRAND_COLORS.PRIMARY,
                    borderWidth: 1,
                    borderColor: isFollowing
                      ? BRAND_COLORS.SECONDARY
                      : BRAND_COLORS.PRIMARY,
                    shadowColor: BRAND_COLORS.PRIMARY,
                    shadowOffset: { width: 0, height: responsiveSize(4) },
                    shadowOpacity: 0.1,
                    shadowRadius: responsiveSize(8),
                    elevation: 4,
                    opacity: isFollowLoading ? 0.7 : 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: responsiveFontSize(15),
                      fontWeight: "700",
                      color: isFollowing
                        ? BRAND_COLORS.SECONDARY
                        : BRAND_COLORS.SURFACE,
                      letterSpacing: 0.3,
                    }}
                  >
                    {isFollowLoading
                      ? "..."
                      : isFollowing
                        ? "Following"
                        : "Follow"}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Profile Info */}
            <Animated.View style={profileInfoAnimatedStyle}>
              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <Text
                    style={{
                      fontSize: responsiveFontSize(22),
                      fontWeight: "800",
                      color: BRAND_COLORS.TEXT_PRIMARY,
                      marginRight: responsiveMargin(8),
                      letterSpacing: 0.3,
                    }}
                  >
                    {user?.firstName} {user?.lastName}
                  </Text>
                  {user?.verified && (
                    <View
                      style={{
                        width: responsiveSize(24),
                        height: responsiveSize(24),
                        borderRadius: responsiveBorderRadius(12),
                        backgroundColor: BRAND_COLORS.PRIMARY,
                        justifyContent: "center",
                        alignItems: "center",
                        shadowColor: BRAND_COLORS.PRIMARY,
                        shadowOffset: { width: 0, height: responsiveSize(2) },
                        shadowOpacity: 0.3,
                        shadowRadius: responsiveSize(4),
                      }}
                    >
                      <MaterialCommunityIcons
                        name="check"
                        size={responsiveIconSize(14)}
                        color={BRAND_COLORS.SURFACE}
                      />
                    </View>
                  )}
                </View>

                <Text
                  style={{
                    fontSize: responsiveFontSize(15),
                    color: BRAND_COLORS.TEXT_SECONDARY,
                    marginBottom: responsiveMargin(12),
                    fontWeight: "500",
                  }}
                >
                  @{user.username}
                </Text>

                <Text
                  style={{
                    fontSize: responsiveFontSize(16),
                    color: BRAND_COLORS.TEXT_PRIMARY,
                    lineHeight: responsiveSize(24),
                    marginBottom: responsiveMargin(16),
                  }}
                >
                  {user?.bio || "This mind hasn't shared thoughts yet..."}
                </Text>

                <View className="space-y-3">
                  <View className="flex-row items-center">
                    <View
                      style={{
                        width: responsiveSize(32),
                        height: responsiveSize(32),
                        borderRadius: responsiveBorderRadius(16),
                        backgroundColor: `${BRAND_COLORS.ACCENT_MINT}15`,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: responsiveMargin(12),
                      }}
                    >
                      <Feather
                        name="map-pin"
                        size={responsiveIconSize(16)}
                        color={BRAND_COLORS.ACCENT_MINT}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: responsiveFontSize(15),
                        color: BRAND_COLORS.TEXT_SECONDARY,
                        fontWeight: "500",
                      }}
                    >
                      {user?.location || "Location unknown"}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <View
                      style={{
                        width: responsiveSize(32),
                        height: responsiveSize(32),
                        borderRadius: responsiveBorderRadius(16),
                        backgroundColor: `${BRAND_COLORS.SECONDARY}15`,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: responsiveMargin(12),
                      }}
                    >
                      <Feather
                        name="calendar"
                        size={responsiveIconSize(16)}
                        color={BRAND_COLORS.SECONDARY}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: responsiveFontSize(15),
                        color: BRAND_COLORS.TEXT_SECONDARY,
                        fontWeight: "500",
                      }}
                    >
                      Joined{" "}
                      {user?.createdAt
                        ? format(new Date(user.createdAt), "MMMM yyyy")
                        : "recently"}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Enhanced Stats */}
            <Animated.View style={statsAnimatedStyle}>
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: `${BRAND_COLORS.BACKGROUND}60`,
                  borderRadius: responsiveBorderRadius(20),
                  padding: responsivePadding(16),
                  borderWidth: 1,
                  borderColor: `${BRAND_COLORS.BORDER_LIGHT}40`,
                }}
              >
                <TouchableOpacity style={{ flex: 1, alignItems: "center" }}>
                  <View
                    style={{
                      width: responsiveSize(44),
                      height: responsiveSize(44),
                      borderRadius: responsiveBorderRadius(22),
                      backgroundColor: `${BRAND_COLORS.PRIMARY}15`,
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: responsiveMargin(8),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: responsiveFontSize(18),
                        fontWeight: "800",
                        color: BRAND_COLORS.PRIMARY,
                      }}
                    >
                      {user?.following?.length || 0}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(13),
                      color: BRAND_COLORS.TEXT_SECONDARY,
                      fontWeight: "600",
                    }}
                  >
                    Following
                  </Text>
                </TouchableOpacity>

                <View
                  style={{
                    width: 1,
                    height: responsiveSize(40),
                    backgroundColor: `${BRAND_COLORS.BORDER_LIGHT}60`,
                    alignSelf: "center",
                  }}
                />

                <TouchableOpacity style={{ flex: 1, alignItems: "center" }}>
                  <View
                    style={{
                      width: responsiveSize(44),
                      height: responsiveSize(44),
                      borderRadius: responsiveBorderRadius(22),
                      backgroundColor: `${BRAND_COLORS.ACCENT_MINT}15`,
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: responsiveMargin(8),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: responsiveFontSize(18),
                        fontWeight: "800",
                        color: BRAND_COLORS.ACCENT_MINT,
                      }}
                    >
                      {user?.followers?.length || 0}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(13),
                      color: BRAND_COLORS.TEXT_SECONDARY,
                      fontWeight: "600",
                    }}
                  >
                    Followers
                  </Text>
                </TouchableOpacity>

                <View
                  style={{
                    width: 1,
                    height: responsiveSize(40),
                    backgroundColor: `${BRAND_COLORS.BORDER_LIGHT}60`,
                    alignSelf: "center",
                  }}
                />

                <View style={{ flex: 1, alignItems: "center" }}>
                  <View
                    style={{
                      width: responsiveSize(44),
                      height: responsiveSize(44),
                      borderRadius: responsiveBorderRadius(22),
                      backgroundColor: `${BRAND_COLORS.ACCENT_YELLOW}15`,
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: responsiveMargin(8),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: responsiveFontSize(18),
                        fontWeight: "800",
                        color: BRAND_COLORS.ACCENT_YELLOW,
                      }}
                    >
                      {userPosts.length}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(13),
                      color: BRAND_COLORS.TEXT_SECONDARY,
                      fontWeight: "600",
                    }}
                  >
                    Thoughts
                  </Text>
                </View>
              </View>
            </Animated.View>
          </View>

          {/* Posts Section with Enhanced Styling */}
          <View
            style={{
              marginTop: responsiveMargin(20),
              backgroundColor: BRAND_COLORS.SURFACE,
              marginHorizontal: responsiveMargin(12),
              borderRadius: responsiveBorderRadius(24),
              paddingTop: responsivePadding(16),
              shadowColor: BRAND_COLORS.PRIMARY,
              shadowOffset: { width: 0, height: responsiveSize(4) },
              shadowOpacity: 0.08,
              shadowRadius: responsiveSize(12),
              elevation: 8,
            }}
          >
            <PostsList username={user?.username} />
          </View>
        </AnimatedScrollView>
      </SafeAreaView>
    </View>
  );
};

export default UserProfileScreen;
