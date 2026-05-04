/**
 * Followers / Following list screen.
 *
 * Single screen drives both routes via the `?mode=followers|following`
 * query param so we don't ship two near-identical files. Each row
 * routes to the user-profile screen on tap.
 */
import React, { useCallback } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import { Feather } from "@expo/vector-icons";

import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { useTheme } from "@/hooks/useTheme";
import { useApiClient, userApi } from "@/utils/api";
import type { User } from "@/types";

type Mode = "followers" | "following";

export default function FollowersScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { username, mode } = useLocalSearchParams<{
    username: string;
    mode?: Mode;
  }>();
  const api = useApiClient();
  const resolvedMode: Mode = mode === "following" ? "following" : "followers";

  const {
    data: users,
    isLoading,
    error,
  } = useQuery<User[]>({
    queryKey: ["user-list", username, resolvedMode],
    queryFn: async () => {
      if (!username) return [];
      const response =
        resolvedMode === "followers"
          ? await userApi.getFollowers<User>(api, username)
          : await userApi.getFollowing<User>(api, username);
      return response.data.users ?? [];
    },
    enabled: !!username,
    staleTime: 30_000,
  });

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<User>) => (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/user-profile",
            params: { userId: item._id, username: item.username },
          })
        }
        android_ripple={{ color: colors.overlay.press }}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.base,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          backgroundColor: pressed ? colors.surface.secondary : "transparent",
        })}
      >
        <Avatar
          source={item.profilePicture}
          name={`${item.firstName} ${item.lastName}`}
          size={48}
        />
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text variant="subtitle" tone="primary" weight="700" numberOfLines={1}>
              {item.firstName} {item.lastName}
            </Text>
            {item.verified ? <VerifiedBadge size={14} /> : null}
          </View>
          <Text variant="bodySm" tone="secondary" numberOfLines={1}>
            @{item.username}
          </Text>
        </View>
      </Pressable>
    ),
    [colors.overlay.press, colors.surface.secondary, router, spacing.base, spacing.lg, spacing.md]
  );

  const keyExtractor = useCallback((u: User) => u._id, []);

  const title = resolvedMode === "followers" ? "Followers" : "Following";

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.canvas }}>
      <SafeAreaView edges={["top"]}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            gap: spacing.md,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.border.subtle,
          }}
        >
          <IconButton accessibilityLabel="Back" onPress={() => router.back()} variant="filled">
            <Feather name="arrow-left" size={18} color={colors.text.primary} />
          </IconButton>
          <View style={{ flex: 1 }}>
            <Text variant="title" tone="primary">
              {title}
            </Text>
            <Text variant="bodySm" tone="secondary">
              @{username}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {isLoading ? (
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md }}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={{ flexDirection: "row", alignItems: "center", gap: spacing.base }}
            >
              <Skeleton width={48} height={48} radius={24} />
              <View style={{ flex: 1, gap: 6 }}>
                <Skeleton width="40%" height={14} />
                <Skeleton width="60%" height={12} />
              </View>
            </View>
          ))}
        </View>
      ) : error ? (
        <EmptyState
          icon={<Feather name="alert-triangle" size={28} color={colors.tint.danger} />}
          title="Couldn't load this list"
          description="Network blip, most likely. Pull back and try again."
        />
      ) : !users || users.length === 0 ? (
        <EmptyState
          icon={<Feather name="users" size={28} color={colors.tint.primary} />}
          title={
            resolvedMode === "followers"
              ? "No followers yet"
              : "Not following anyone yet"
          }
          description={
            resolvedMode === "followers"
              ? "Once people follow this account, they'll show up here."
              : "Search for people you know and tap Follow to start filling this list."
          }
        />
      ) : (
        <FlashList<User>
          data={users}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: 80 }}
        />
      )}
    </View>
  );
}
