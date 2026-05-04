import React, { useCallback, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { format } from "date-fns";
import { Feather } from "@expo/vector-icons";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import EditProfileModal from "@/components/EditProfileModal";
import PostsList from "@/components/PostsList";
import ProfileTabs, { type ProfileTab } from "@/components/ProfileTabs";
import SignOutButton from "@/components/SignOutButton";
import VerificationProgress from "@/components/VerificationProgress";

import { useTheme } from "@/hooks/useTheme";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { usePosts } from "@/hooks/usePosts";
import { useProfile } from "@/hooks/useProfile";
import { formatNumber } from "@/utils/formatter";

/**
 * Profile (current user).
 *
 * Hierarchy reads top-to-bottom:
 *   banner → identity → bio → meta → stats → tabs → content.
 *
 * Psychology lever — Progressive disclosure + Locus of control:
 *  Tabs let the user pick the slice they care about (Posts / Replies /
 *  Media / Likes) without committing to a full second screen. Replies,
 *  Media, and Likes carry honest copy explaining they're coming —
 *  never a stub or "TODO". Edit-profile is pinned next to the avatar
 *  (Fitts's Law — close to existing focus, easy to reach).
 *
 * Performance:
 *  - Posts list is delegated to PostsList (FlashList recycler).
 *  - Banner image uses native cover scaling at a fixed aspect ratio so
 *    we don't trigger image decoding on layout changes.
 */
export default function ProfileScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  const { currentUser, isLoading } = useCurrentUser();
  const {
    posts: userPosts,
    refetch: refetchPosts,
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
    selectedProfileImage,
    selectedBannerImage,
    pickImageFromGallery,
    takePhoto,
    removeImage,
    verificationResult,
    handleAutoVerification,
    getVerificationProgressValue,
    getVerificationStatusMessageValue,
    getVerificationRequirementsValue,
    isCheckingVerification,
    usernameValidation,
    usernameValidate,
    usernameValidateErrors,
  } = useProfile();

  const { showInfo, showError } = useCustomAlert({ useNative: true });

  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchProfile(), refetchPosts()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchPosts, refetchProfile]);

  const handleVerificationRequest = useCallback(async () => {
    try {
      const isEligible = verificationResult?.isEligible || false;
      if (isEligible) {
        await handleAutoVerification();
      } else {
        const reqs = (getVerificationRequirementsValue() ?? []).join("\n• ");
        showInfo(
          "Almost there",
          `Finish these and we'll verify you automatically:\n\n• ${reqs}`
        );
      }
    } catch {
      showError("Request failed", "Try again in a moment.");
    }
  }, [
    getVerificationRequirementsValue,
    handleAutoVerification,
    showError,
    showInfo,
    verificationResult,
  ]);

  const tabContent = useMemo(() => {
    if (!currentUser) return null;
    if (activeTab === "posts") {
      return <PostsList username={currentUser.username} />;
    }
    if (activeTab === "media") {
      const mediaPosts = (userPosts ?? []).filter((p) => !!p.image);
      if (mediaPosts.length === 0) {
        return (
          <EmptyState
            icon={<Feather name="image" size={26} color={colors.tint.primary} />}
            title="No media yet"
            description="Post a photo and it'll show up here. Image-only filtering arrives next."
          />
        );
      }
      return <PostsList posts={mediaPosts} />;
    }
    if (activeTab === "replies") {
      return (
        <EmptyState
          icon={<Feather name="message-circle" size={26} color={colors.tint.primary} />}
          title="Replies, soon"
          description="A dedicated thread of every conversation you're in is on the way. Until then, your replies live under each post."
        />
      );
    }
    return (
      <EmptyState
        icon={<Feather name="heart" size={26} color={colors.tint.primary} />}
        title="Likes are private — for now"
        description="Your liked posts will land here in a future update with a privacy toggle."
      />
    );
  }, [activeTab, colors.tint.primary, currentUser, userPosts]);

  if (isLoading || !currentUser?._id) {
    return (
      <View className="flex-1 bg-canvas">
        <SafeAreaView edges={["top"]}>
          <View className="px-lg pt-md gap-md">
            <Skeleton width="100%" height={200} radius={16} />
            <Skeleton width="50%" height={20} />
            <Skeleton width="40%" height={14} />
            <Skeleton width="100%" height={64} radius={16} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const joined = currentUser.createdAt
    ? format(new Date(currentUser.createdAt), "MMMM yyyy")
    : null;

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView edges={["top"]} className="bg-canvas">
        <View className="flex-row items-center justify-between px-lg py-md border-b border-subtle">
          <View className="flex-1">
            <Text variant="title" tone="primary" numberOfLines={1}>
              {currentUser.firstName} {currentUser.lastName}
            </Text>
            <Text variant="bodySm" tone="secondary">
              {userPosts?.length === 1 ? "1 post" : `${userPosts?.length || 0} posts`}
            </Text>
          </View>
          <SignOutButton />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.tint.primary}
            colors={[colors.tint.primary]}
          />
        }
      >
        {/* Banner — 3:1 ratio mirrors Twitter/X header proportions, leaving
            generous room for the avatar overlap below without dominating
            the screen. expo-image keeps decode off the JS thread. */}
        <ExpoImage
          source={
            currentUser.bannerImage
              ? { uri: currentUser.bannerImage }
              : require("../../assets/images/default-banner.jpeg")
          }
          style={{ width: "100%", aspectRatio: 3 / 1 }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />

        {/* Identity card */}
        <Card
          variant="solid"
          radius={24}
          className="mx-base -mt-xl pt-lg border border-subtle"
        >
          <View className="flex-row items-end justify-between -mt-[64px] mb-md">
            <Avatar
              source={currentUser.profilePicture}
              name={`${currentUser.firstName} ${currentUser.lastName}`}
              size={88}
              ringColor={colors.surface.primary}
              style={{ borderWidth: 4, borderColor: colors.surface.primary }}
            />
            <Button label="Edit profile" variant="secondary" size="sm" onPress={openEditModal} />
          </View>

          <View className="flex-row items-center gap-sm">
            <Text variant="title" tone="primary" numberOfLines={1}>
              {currentUser.firstName} {currentUser.lastName}
            </Text>
            {currentUser.verified ? <VerifiedBadge size={18} /> : null}
          </View>
          <Text variant="bodySm" tone="secondary" className="mt-[2px]">
            @{currentUser.username}
          </Text>

          {currentUser.bio ? (
            <Text variant="body" tone="primary" className="mt-md">
              {currentUser.bio}
            </Text>
          ) : (
            <Text
              variant="body"
              tone="tertiary"
              className="mt-md italic"
            >
              Add a one-line bio so people know who they're following.
            </Text>
          )}

          <View className="mt-md gap-xs">
            {currentUser.location ? (
              <MetaRow icon="map-pin" label={currentUser.location} />
            ) : null}
            {joined ? <MetaRow icon="calendar" label={`Joined ${joined}`} /> : null}
          </View>

          {/* Stats row — generous separators, bold numbers, consistent column widths. */}
          <View
            style={{
              flexDirection: "row",
              marginTop: spacing.lg,
              borderRadius: 16,
              backgroundColor: colors.surface.secondary,
              borderWidth: 1,
              borderColor: colors.border.subtle,
              paddingVertical: spacing.md,
            }}
          >
            <Stat
              label="Following"
              value={formatNumber(currentUser.following?.length ?? 0)}
            />
            <Divider />
            <Stat
              label="Followers"
              value={formatNumber(currentUser.followers?.length ?? 0)}
            />
            <Divider />
            <Stat label="Posts" value={formatNumber(userPosts?.length || 0)} />
          </View>
        </Card>

        <View className="px-base mt-md">
          <VerificationProgress
            isVerified={currentUser.verified}
            progress={getVerificationProgressValue()}
            statusMessage={getVerificationStatusMessageValue()}
            isEligible={verificationResult?.isEligible || false}
            onVerificationRequest={handleVerificationRequest}
            isChecking={isCheckingVerification}
            missingRequirements={getVerificationRequirementsValue()}
          />
        </View>

        <View className="mt-md">
          <ProfileTabs active={activeTab} onChange={setActiveTab} />
          <View style={{ minHeight: 240 }}>{tabContent}</View>
        </View>
      </ScrollView>

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
        usernameValidation={usernameValidation}
        usernameValidate={usernameValidate}
        usernameValidateErrors={usernameValidateErrors}
      />
    </View>
  );
}

function MetaRow({ icon, label }: { icon: keyof typeof Feather.glyphMap; label: string }) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center gap-sm">
      <Feather name={icon} size={14} color={colors.text.tertiary} />
      <Text variant="bodySm" tone="secondary">
        {label}
      </Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Pressable accessibilityRole="button" className="flex-1 items-center">
      <Text variant="title" tone="primary" weight="700">
        {value}
      </Text>
      <Text variant="caption" tone="tertiary">
        {label}
      </Text>
    </Pressable>
  );
}

function Divider() {
  const { colors } = useTheme();
  return (
    <View
      className="w-[1px] self-stretch my-xs"
      style={{ backgroundColor: colors.border.subtle }}
    />
  );
}