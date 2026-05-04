import React from "react";
import { View } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Surface } from "@/components/ui/Surface";
import { Text } from "@/components/ui/Text";
import { IconButton } from "@/components/ui/IconButton";
import PostComposer from "@/components/PostComposer";
import PostsList from "@/components/PostsList";

import { useFeedRanking } from "@/hooks/useFeedRanking";
import { useTheme } from "@/hooks/useTheme";
import { useUserSync } from "@/hooks/useUserSync";

/**
 * Home — the feed.
 *
 * Header is a translucent surface (Liquid Glass on iOS 26, BlurView on
 * iOS <26, flat on Android) so content scrolls under it with a soft
 * focus on the brand mark, the way Twitter/X and Threads do it. Pull
 * to refresh + infinite scroll live inside `PostsList`, so this screen
 * stays a thin shell with no per-render work besides the header.
 */
export default function HomeScreen() {
  const { colors } = useTheme();

  const {
    posts: rankedPosts,
    isLoading,
    error,
    refetch: refetchPosts,
  } = useFeedRanking({ useAdvancedAlgorithm: true, maxPosts: 25 });

  // Sync local user record with backend on first focus.
  useUserSync();

  const headerSlot = (
    <Surface variant="glass" className="border-b border-subtle">
      <SafeAreaView edges={["top"]}>
        <View className="flex-row items-center px-lg py-md">
          <View
            className="w-[36px] h-[36px] rounded-md items-center justify-center"
            style={{ backgroundColor: colors.tint.primary }}
          >
            <ExpoImage
              source={require("@/assets/images/xMind-Logo1.png")}
              style={{ width: 22, height: 22, tintColor: colors.text.onTint }}
              contentFit="contain"
            />
          </View>
          <Text
            variant="title"
            tone="primary"
            weight="800"
            style={{ flex: 1, marginLeft: 12 }}
          >
            xMind
          </Text>
          <IconButton
            accessibilityLabel="Settings"
            variant="ghost"
            onPress={() => undefined}
          >
            <Feather name="settings" size={20} color={colors.text.primary} />
          </IconButton>
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
          description="A network hiccup, most likely. Pull down to try again."
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
    </View>
  );
}