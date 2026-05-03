import React, { useCallback, useState } from "react";
import { Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Surface } from "@/components/ui/Surface";
import { Text } from "@/components/ui/Text";
import { IconButton } from "@/components/ui/IconButton";
import PostComposer from "@/components/PostComposer";
import PostsList from "@/components/PostsList";
import SignOutButton from "@/components/SignOutButton";

import { useFeedRanking } from "@/hooks/useFeedRanking";
import { useTheme } from "@/hooks/useTheme";
import { useUserSync } from "@/hooks/useUserSync";

/**
 * Home — the calm centre of the app.
 *
 * Layout is mostly NativeWind classes; only theme tokens that need
 * runtime resolution (logo tint, dynamic icon colour) flow through
 * `useTheme()`. CSS-variable colour tokens defined in `global.css`
 * make `bg-canvas`, `text-primary`, etc. swap automatically with the
 * OS colour scheme.
 */
export default function HomeScreen() {
  const { colors } = useTheme();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    posts: rankedPosts,
    isLoading,
    error,
    refetch: refetchPosts,
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

  // Sync local user record with backend on first focus.
  useUserSync();

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchPosts();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchPosts]);

  const headerSlot = (
    <Surface variant="glass" className="border-b border-subtle">
      <SafeAreaView edges={["top"]}>
        <View className="flex-row items-center gap-md px-lg py-md">
          <View
            className="w-[36px] h-[36px] rounded-md items-center justify-center"
            style={{ backgroundColor: colors.tint.primary }}
          >
            <Image
              source={require("@/assets/images/xMind-Logo1.png")}
              style={{ width: 22, height: 22, tintColor: colors.text.onTint }}
              resizeMode="contain"
            />
          </View>
          <View className="flex-1">
            <Text variant="title" tone="primary">
              xMind
            </Text>
            <Text variant="bodySm" tone="secondary">
              Today, slowly.
            </Text>
          </View>
          <SignOutButton />
        </View>
      </SafeAreaView>
    </Surface>
  );

  if (error && !rankedPosts?.length) {
    return (
      <View className="flex-1 bg-canvas">
        {headerSlot}
        <EmptyState
          icon={<Feather name="alert-triangle" size={28} color={colors.tint.danger} />}
          title="The feed didn't load"
          description="A network hiccup, most likely. Tap below or pull down to refresh."
          action={<Button label="Try again" onPress={() => refetchPosts()} />}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      {headerSlot}
      <PostsList
        posts={isLoading ? undefined : rankedPosts}
        ListHeaderComponent={
          <View className="px-base mt-sm">
            <PostComposer />
          </View>
        }
      />

      {isRefreshing ? (
        <View
          pointerEvents="none"
          className="absolute top-[96px] self-center bg-surface-raised rounded-pill px-base py-xs border border-subtle"
        >
          <Text variant="caption" tone="secondary">
            Refreshing your feed
          </Text>
        </View>
      ) : null}

      <RefreshFromHeader onRefresh={onRefresh} isRefreshing={isRefreshing} />
    </View>
  );
}

/**
 * Tiny inline component that exposes a manual refresh affordance from
 * the header overlay. Floats above the list as a refined alternative
 * to a giant primary button while preserving discoverability.
 */
function RefreshFromHeader({
  onRefresh,
  isRefreshing,
}: {
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      pointerEvents="box-none"
      className="absolute right-base bottom-[120px]"
    >
      <IconButton
        accessibilityLabel="Refresh feed"
        size={48}
        variant="filled"
        onPress={onRefresh}
        style={{
          backgroundColor: colors.surface.raised,
          borderWidth: 1,
          borderColor: colors.border.subtle,
        }}
      >
        <Feather
          name={isRefreshing ? "loader" : "rotate-cw"}
          size={20}
          color={colors.text.primary}
        />
      </IconButton>
    </View>
  );
}
