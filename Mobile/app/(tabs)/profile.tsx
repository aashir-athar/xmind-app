import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  withDelay,
  withSequence,
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
import { useCustomAlert } from "@/hooks/useCustomAlert";
import EditProfileModal from "@/components/EditProfileModal";
import CustomAlert from "@/components/CustomAlert";

import { BRAND_COLORS, HEADER_CONFIG } from "@/constants/colors";
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
import VerificationProgress from "@/components/VerificationProgress";
import { formatNumber } from "@/utils/formatter";

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

  // Use the new combined useProfile hook
  const {
    isEditModalVisible,
    openEditModal,
    closeEditModal,
    formData,
    saveProfile,
    updateFormField,
    isUpdating,
    refetch: refetchProfile,
    selectedProfileImage,
    selectedBannerImage,
    pickImageFromGallery,
    takePhoto,
    removeImage,
    verificationResult,
    checkVerification,
    handleAutoVerification,
    getVerificationProgressValue,
    getVerificationStatusMessageValue,
    getVerificationRequirementsValue,
    isCheckingVerification,
  } = useProfile();

  const {
    showInfo,
    showConfirmation,
    showSuccess,
    showError,
    alertConfig,
    isVisible,
    hideAlert,
  } = useCustomAlert();

  // Animation values
  const headerOpacity = useSharedValue(0);
  const bannerScale = useSharedValue(0.8);
  const avatarScale = useSharedValue(0);
  const profileInfoOpacity = useSharedValue(0);
  const statsOpacity = useSharedValue(0);
  const editButtonScale = useSharedValue(0);
  const bannerOverlayOpacity = useSharedValue(0);

  useEffect(() => {
    // Memoized animation setup function
    const setupAnimations = () => {
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
    };

    // Memoized reset function
    const resetAnimations = () => {
      headerOpacity.value = 0;
      bannerScale.value = 0.8;
      bannerOverlayOpacity.value = 0;
      avatarScale.value = 0;
      profileInfoOpacity.value = 0;
      statsOpacity.value = 0;
      editButtonScale.value = 0;
    };

    if (!isLoading && currentUser?._id) {
      setupAnimations();
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      resetAnimations();
    };
  }, [currentUser?._id]);

  // Additional effect to refresh profile data when currentUser changes
  useEffect(() => {
    if (currentUser?._id && !isLoading) {
      // Refresh profile data to ensure we have the latest information
      refetchProfile();
      checkVerification();
    }
  }, [currentUser?._id, isLoading]);

  // Debug effect to log currentUser changes
  useEffect(() => {
    if (currentUser) {
      console.log("Profile screen - currentUser updated:", {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        bio: currentUser.bio,
        location: currentUser.location,
      });
    }
  }, [
    currentUser?.firstName,
    currentUser?.lastName,
    currentUser?.bio,
    currentUser?.location,
  ]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    // Header stays fixed, no scroll effects
  }));

  const bannerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bannerScale.value }],
  }));

  const bannerOverlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bannerOverlayOpacity.value,
  }));

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
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

  const editButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: editButtonScale.value }],
  }));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchProfile(), refetchPosts()]);
    setIsRefreshing(false);
  };

  const handleVerificationRequest = useCallback(async () => {
    try {
      const progress = getVerificationProgressValue();
      const requirements = getVerificationRequirementsValue();
      const isEligible = verificationResult?.isEligible || false;

      if (isEligible) {
        // User meets all criteria - trigger automatic verification
        await handleAutoVerification();
      } else {
        // Show what's missing
        const missingList = (requirements ?? []).join("\n• ");
        showInfo(
          "Verification Requirements",
          `You need to complete these requirements:\n\n• ${missingList}\n\nKeep building your profile and you'll be automatically verified when ready!`
        );
      }
    } catch (error) {
      console.error("Verification request failed:", error);
      showError(
        "Request Failed",
        "Something went wrong. Please try again later."
      );
    }
  }, [
    verificationResult,
    getVerificationRequirementsValue,
    handleAutoVerification,
    showInfo,
    showError,
  ]);

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
            fontSize: responsiveFontSize(16),
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

      <SafeAreaView className="flex-1" edges={["top"]}>
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
              <View>
                <Text
                  style={{
                    fontSize: responsiveFontSize(HEADER_CONFIG.TITLE_SIZE),
                    fontWeight: "800",
                    color: BRAND_COLORS.TEXT_PRIMARY,
                    letterSpacing: 0.5,
                  }}
                >
                  {currentUser.firstName} {currentUser.lastName}
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
              <SignOutButton />
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
                currentUser.bannerImage
                  ? { uri: currentUser.bannerImage }
                  : require("../../assets/images/default-banner.jpeg")
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
                    position: "relative",
                  }}
                >
                  <Image
                    source={
                      currentUser.profilePicture
                        ? { uri: currentUser.profilePicture }
                        : require("../../assets/images/default-avatar.jpeg")
                    }
                    style={{
                      width: responsiveSize(120),
                      height: responsiveSize(120),
                    }}
                    resizeMode="cover"
                  />
                </View>
              </Animated.View>

              <Animated.View style={editButtonAnimatedStyle}>
                <TouchableOpacity
                  onPress={openEditModal}
                  style={{
                    paddingHorizontal: responsivePadding(24),
                    paddingVertical: responsivePadding(12),
                    borderRadius: responsiveBorderRadius(24),
                    backgroundColor: `${BRAND_COLORS.PRIMARY}10`,
                    borderWidth: 1,
                    borderColor: `${BRAND_COLORS.PRIMARY}30`,
                    shadowColor: BRAND_COLORS.PRIMARY,
                    shadowOffset: { width: 0, height: responsiveSize(4) },
                    shadowOpacity: 0.1,
                    shadowRadius: responsiveSize(8),
                    elevation: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: responsiveFontSize(15),
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
                      fontSize: responsiveFontSize(22),
                      fontWeight: "800",
                      color: BRAND_COLORS.TEXT_PRIMARY,
                      marginRight: responsiveMargin(8),
                      letterSpacing: 0.3,
                    }}
                  >
                    {currentUser.firstName} {currentUser.lastName}
                  </Text>
                  {currentUser.verified && (
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
                  @{currentUser.username}
                </Text>

                <Text
                  style={{
                    fontSize: responsiveFontSize(16),
                    color: BRAND_COLORS.TEXT_PRIMARY,
                    lineHeight: responsiveSize(24),
                    marginBottom: responsiveMargin(16),
                  }}
                >
                  {currentUser?.bio ||
                    "This mind hasn't shared thoughts yet..."}
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
                      {currentUser?.location || "Location unknown"}
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
                      {formatNumber(currentUser.following?.length ?? 0)}
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
                      {formatNumber(currentUser.followers?.length ?? 0)}
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
                      {formatNumber(userPosts.length)}
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

            {/* Verification Status */}
            <VerificationProgress
              isVerified={currentUser?.verified}
              progress={getVerificationProgressValue()}
              statusMessage={getVerificationStatusMessageValue()}
              isEligible={verificationResult?.isEligible || false}
              onVerificationRequest={handleVerificationRequest}
              isChecking={isCheckingVerification}
              missingRequirements={getVerificationRequirementsValue()}
            />
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
          selectedProfileImage={selectedProfileImage}
          selectedBannerImage={selectedBannerImage}
          pickImageFromGallery={pickImageFromGallery}
          takePhoto={takePhoto}
          removeImage={removeImage}
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

export default ProfileScreen;
