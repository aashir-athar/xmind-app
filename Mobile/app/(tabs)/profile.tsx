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
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import SignOutButton from "@/components/SignOutButton";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import PostsList from "@/components/PostsList";
import { format } from "date-fns";
import { usePosts } from "@/hooks/usePosts";
import { useProfile } from "@/hooks/useProfile";
import EditProfileModal from "@/components/EditProfileModal";
import { BRAND_COLORS } from "@/constants/colors";

const { width, height } = Dimensions.get("window");
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const ProfileScreen = () => {
  const { currentUser, isLoading } = useCurrentUser();
  const insets = useSafeAreaInsets();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    posts: userPosts,
    refetch: refetchPosts,
    isLoading: isRefetching,
  } = usePosts(currentUser?.username);

  const {
    isEditModalVisible,
    openEditModal,
    closeEditModal,
    formData,
    saveProfile,
    updateFormField,
    isUpdating,
    refetch: refetchProfile,
  } = useProfile();

  // Animation values
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(0);
  const bannerScale = useSharedValue(0.8);
  const avatarScale = useSharedValue(0);
  const profileInfoOpacity = useSharedValue(0);
  const statsOpacity = useSharedValue(0);
  const editButtonScale = useSharedValue(0);
  const bannerOverlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (!isLoading && currentUser) {
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
      editButtonScale.value = withDelay(1000, withSpring(1, { damping: 15 }));
    }
  }, [isLoading, currentUser]);

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
        translateY: interpolate(scrollY.value, [0, 100], [0, -10]),
      },
    ],
  }));

  const bannerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: bannerScale.value },
      {
        translateY: interpolate(scrollY.value, [0, 200], [0, -50]),
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
        translateY: interpolate(scrollY.value, [0, 100], [0, -20]),
      },
    ],
  }));

  const profileInfoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: profileInfoOpacity.value,
    transform: [
      {
        translateY: interpolate(profileInfoOpacity.value, [0, 1], [20, 0]),
      },
    ],
  }));

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [
      {
        translateY: interpolate(statsOpacity.value, [0, 1], [15, 0]),
      },
    ],
  }));

  const editButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: editButtonScale.value }],
  }));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchProfile(), refetchPosts()]);
    setIsRefreshing(false);
  };

  if (isLoading || !currentUser._id) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: BRAND_COLORS.BACKGROUND,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LinearGradient
          colors={[BRAND_COLORS.PRIMARY, BRAND_COLORS.PRIMARY_LIGHT]}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <ActivityIndicator size="large" color={BRAND_COLORS.SURFACE} />
        </LinearGradient>
        <Text
          style={{
            color: BRAND_COLORS.TEXT_SECONDARY,
            fontSize: 16,
            fontWeight: "500",
          }}
        >
          Loading your mind...
        </Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: BRAND_COLORS.BACKGROUND,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: BRAND_COLORS.TEXT_SECONDARY,
            fontSize: 16,
          }}
        >
          Mind not found.
        </Text>
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

      <SafeAreaView className="flex-1">
        {/* Enhanced Header */}
        <Animated.View style={headerAnimatedStyle}>
          <BlurView
            intensity={15}
            tint="light"
            style={{ paddingHorizontal: 16, paddingVertical: 12 }}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: BRAND_COLORS.TEXT_PRIMARY,
                    letterSpacing: 0.5,
                  }}
                >
                  {currentUser.firstName} {currentUser.lastName}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: BRAND_COLORS.TEXT_SECONDARY,
                    fontWeight: "500",
                  }}
                >
                  {userPosts.length === 0
                    ? "No thoughts yet"
                    : userPosts.length === 1
                      ? "1 Thought"
                      : `${userPosts.length} Thoughts`}
                </Text>
              </View>
              <SignOutButton />
            </View>
          </BlurView>
        </Animated.View>

        <AnimatedScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing} // Add this prop
              onRefresh={handleRefresh} // Use the new async handler
              tintColor={BRAND_COLORS.PRIMARY_LIGHT}
              title="Syncing your mind..."
              titleColor={BRAND_COLORS.TEXT_SECONDARY}
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
                currentUser.bannerImage
                  ? { uri: currentUser.bannerImage }
                  : require("../../assets/images/default-banner.jpeg")
              }
              style={{ width: "100%", height: 200 }}
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
              paddingHorizontal: 20,
              paddingBottom: 24,
              backgroundColor: BRAND_COLORS.SURFACE,
              marginHorizontal: 12,
              marginTop: -20,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              shadowColor: BRAND_COLORS.PRIMARY,
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 20,
              elevation: 12,
            }}
          >
            <View
              className="flex-row justify-between items-end"
              style={{ marginTop: -40, marginBottom: 20 }}
            >
              <Animated.View style={avatarAnimatedStyle}>
                <View
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    borderWidth: 4,
                    borderColor: BRAND_COLORS.SURFACE,
                    overflow: "hidden",
                    shadowColor: BRAND_COLORS.PRIMARY,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.2,
                    shadowRadius: 16,
                    elevation: 10,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={
                      currentUser.profilePicture
                        ? { uri: currentUser.profilePicture }
                        : require("../../assets/images/default-avatar.jpeg")
                    }
                    style={{ width: 120, height: 120 }}
                    resizeMode="cover"
                  />
                </View>
              </Animated.View>

              <Animated.View style={editButtonAnimatedStyle}>
                <TouchableOpacity
                  onPress={openEditModal}
                  style={{
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 24,
                    backgroundColor: `${BRAND_COLORS.PRIMARY}10`,
                    borderWidth: 1,
                    borderColor: `${BRAND_COLORS.PRIMARY}30`,
                    shadowColor: BRAND_COLORS.PRIMARY,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: BRAND_COLORS.PRIMARY,
                      letterSpacing: 0.3,
                    }}
                  >
                    Edit Profile
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
                      fontSize: 22,
                      fontWeight: "800",
                      color: BRAND_COLORS.TEXT_PRIMARY,
                      marginRight: 8,
                      letterSpacing: 0.3,
                    }}
                  >
                    {currentUser.firstName} {currentUser.lastName}
                  </Text>
                  {currentUser.user?.verified && (
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: BRAND_COLORS.PRIMARY,
                        justifyContent: "center",
                        alignItems: "center",
                        shadowColor: BRAND_COLORS.PRIMARY,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="check"
                        size={14}
                        color={BRAND_COLORS.SURFACE}
                      />
                    </View>
                  )}
                </View>

                <Text
                  style={{
                    fontSize: 15,
                    color: BRAND_COLORS.TEXT_SECONDARY,
                    marginBottom: 12,
                    fontWeight: "500",
                  }}
                >
                  @{currentUser.username}
                </Text>

                <Text
                  style={{
                    fontSize: 16,
                    color: BRAND_COLORS.TEXT_PRIMARY,
                    lineHeight: 24,
                    marginBottom: 16,
                  }}
                >
                  {currentUser?.bio ||
                    "This mind hasn't shared thoughts yet..."}
                </Text>

                <View className="space-y-3">
                  <View className="flex-row items-center">
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: `${BRAND_COLORS.ACCENT_MINT}15`,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 12,
                      }}
                    >
                      <Feather
                        name="map-pin"
                        size={16}
                        color={BRAND_COLORS.ACCENT_MINT}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 15,
                        color: BRAND_COLORS.TEXT_SECONDARY,
                        fontWeight: "500",
                      }}
                    >
                      {currentUser?.location || "Location unknown"}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: `${BRAND_COLORS.SECONDARY}15`,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 12,
                      }}
                    >
                      <Feather
                        name="calendar"
                        size={16}
                        color={BRAND_COLORS.SECONDARY}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 15,
                        color: BRAND_COLORS.TEXT_SECONDARY,
                        fontWeight: "500",
                      }}
                    >
                      Joined{" "}
                      {format(new Date(currentUser.createdAt), "MMMM yyyy")}
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
                  borderRadius: 20,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: `${BRAND_COLORS.BORDER_LIGHT}40`,
                }}
              >
                <TouchableOpacity style={{ flex: 1, alignItems: "center" }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: `${BRAND_COLORS.PRIMARY}15`,
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: BRAND_COLORS.PRIMARY,
                      }}
                    >
                      {currentUser.following?.length || 0}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
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
                    height: 40,
                    backgroundColor: `${BRAND_COLORS.BORDER_LIGHT}60`,
                    alignSelf: "center",
                  }}
                />

                <TouchableOpacity style={{ flex: 1, alignItems: "center" }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: `${BRAND_COLORS.ACCENT_MINT}15`,
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: BRAND_COLORS.ACCENT_MINT,
                      }}
                    >
                      {currentUser.followers?.length || 0}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
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
                    height: 40,
                    backgroundColor: `${BRAND_COLORS.BORDER_LIGHT}60`,
                    alignSelf: "center",
                  }}
                />

                <View style={{ flex: 1, alignItems: "center" }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: `${BRAND_COLORS.ACCENT_YELLOW}15`,
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: BRAND_COLORS.ACCENT_YELLOW,
                      }}
                    >
                      {userPosts.length}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
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
              marginTop: 20,
              backgroundColor: BRAND_COLORS.SURFACE,
              marginHorizontal: 12,
              borderRadius: 24,
              paddingTop: 16,
              shadowColor: BRAND_COLORS.PRIMARY,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <PostsList username={currentUser?.username} />
          </View>
        </AnimatedScrollView>

        <EditProfileModal
          isVisible={isEditModalVisible}
          onClose={closeEditModal}
          formData={formData}
          saveProfile={saveProfile}
          updateFormField={updateFormField}
          isUpdating={isUpdating}
        />
      </SafeAreaView>
    </View>
  );
};

export default ProfileScreen;
