import React, { useCallback, useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { format } from "date-fns";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import PostsList from "@/components/PostsList";
import { useTheme } from "@/hooks/useTheme";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import { useUserProfile } from "@/hooks/useUserProfile";
import { formatNumber } from "@/utils/formatter";

/**
 * Public profile of another user.
 *
 * Mirrors the current-user profile layout for muscle memory, but swaps
 * the "Edit profile" CTA for a Follow / Following toggle. Following
 * uses a tinted secondary style; pressing again returns to the primary
 * outline so users can confirm the state at a glance.
 */
export default function UserProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { username } = useLocalSearchParams<{ userId: string; username: string }>();

  const { currentUser } = useCurrentUser();
  const { user, isLoading, error, refetch, toggleFollow, isFollowLoading } =
    useUserProfile(username);

  const { posts: userPosts, refetch: refetchPosts } = usePosts(username);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const isFollowing = !!user && (currentUser?.following?.includes(user._id) ?? false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetch(), refetchPosts()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, refetchPosts]);

  const handleFollow = useCallback(() => {
    if (user) toggleFollow(user._id);
  }, [toggleFollow, user]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-canvas">
        <SafeAreaView edges={["top"]}>
          <View className="px-lg pt-md gap-md">
            <Skeleton width="100%" height={180} radius={16} />
            <Skeleton width="50%" height={20} />
            <Skeleton width="40%" height={14} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (error || !user) {
    return (
      <View className="flex-1 bg-canvas">
        <Header onBack={() => router.back()} title={username} />
        <EmptyState
          icon={<Feather name="user-x" size={28} color={colors.tint.danger} />}
          title="We can't find that profile"
          description="It might have been deactivated, or the username changed."
          action={<Button label="Go back" variant="secondary" onPress={() => router.back()} />}
        />
      </View>
    );
  }

  const joined = user.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : null;

  return (
    <View className="flex-1 bg-canvas">
      <Header
        onBack={() => router.back()}
        title={`${user.firstName} ${user.lastName}`}
        subtitle={`${userPosts?.length ?? 0} posts`}
      />

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
        <Image
          source={
            user.bannerImage
              ? { uri: user.bannerImage }
              : require("../assets/images/default-banner.jpeg")
          }
          style={{ width: "100%", height: 220 }}
          resizeMode="cover"
        />

        <Card
          variant="solid"
          radius={24}
          className="mx-base -mt-xl pt-lg border border-subtle"
        >
          <View className="flex-row items-end justify-between -mt-[64px] mb-md">
            <Avatar
              source={user.profilePicture}
              name={`${user.firstName} ${user.lastName}`}
              size={88}
              ringColor={colors.surface.primary}
              style={{ borderWidth: 4, borderColor: colors.surface.primary }}
            />
            <Button
              label={isFollowing ? "Following" : "Follow"}
              variant={isFollowing ? "secondary" : "primary"}
              size="sm"
              loading={isFollowLoading}
              onPress={handleFollow}
            />
          </View>

          <View className="flex-row items-center gap-sm">
            <Text variant="title" tone="primary" numberOfLines={1}>
              {user.firstName} {user.lastName}
            </Text>
            {user.verified ? (
              <View
                className="w-[20px] h-[20px] rounded-full items-center justify-center"
                style={{ backgroundColor: colors.tint.primary }}
              >
                <MaterialCommunityIcons name="check" size={12} color={colors.text.onTint} />
              </View>
            ) : null}
          </View>
          <Text variant="bodySm" tone="secondary" className="mt-[2px]">
            @{user.username}
          </Text>

          {user.bio ? (
            <Text variant="body" tone="primary" className="mt-md">
              {user.bio}
            </Text>
          ) : null}

          <View className="mt-md gap-xs">
            {user.location ? (
              <View className="flex-row items-center gap-sm">
                <Feather name="map-pin" size={14} color={colors.text.tertiary} />
                <Text variant="bodySm" tone="secondary">
                  {user.location}
                </Text>
              </View>
            ) : null}
            {joined ? (
              <View className="flex-row items-center gap-sm">
                <Feather name="calendar" size={14} color={colors.text.tertiary} />
                <Text variant="bodySm" tone="secondary">
                  Joined {joined}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="flex-row mt-lg rounded-lg bg-surface-secondary py-md">
            <Stat label="Following" value={formatNumber(user.following?.length ?? 0)} />
            <Divider />
            <Stat label="Followers" value={formatNumber(user.followers?.length ?? 0)} />
            <Divider />
            <Stat label="Posts" value={formatNumber(userPosts?.length || 0)} />
          </View>
        </Card>

        <View className="mt-md">
          <PostsList username={user.username} />
        </View>
      </ScrollView>
    </View>
  );
}

function Header({
  onBack,
  title,
  subtitle,
}: {
  onBack: () => void;
  title?: string;
  subtitle?: string;
}) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={["top"]} className="bg-canvas">
      <View className="flex-row items-center gap-md px-lg py-md border-b border-subtle">
        <IconButton accessibilityLabel="Back" onPress={onBack} variant="filled">
          <Feather name="arrow-left" size={18} color={colors.text.primary} />
        </IconButton>
        <View className="flex-1">
          {title ? (
            <Text variant="title" tone="primary" numberOfLines={1}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text variant="bodySm" tone="secondary">
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
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
