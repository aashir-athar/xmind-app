import React, { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Surface } from "@/components/ui/Surface";
import { Text } from "@/components/ui/Text";
import { IconButton } from "@/components/ui/IconButton";
import PostComposer from "@/components/PostComposer";
import PostsList from "@/components/PostsList";
import TrendingRail from "@/components/TrendingRail";

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
 *
 * Psychology lever — Locus of control:
 *  Tapping the logo scrolls the feed to top — the muscle-memory
 *  shortcut every social app trains. It's a tiny, invisible affordance
 *  that pays off the moment a user reaches for it.
 */
export default function HomeScreen() {
  const { colors } = useTheme();

  const {
    posts: rankedPosts,
    isLoading,
    error,
    refetch: refetchPosts,
  } = useFeedRanking({
    useAdvancedAlgorithm: true,
    maxPosts: 25,
    chronologicalBlendEvery: 4,
  });

  // Sync local user record with backend on first focus.
  useUserSync();

  // Bump this counter from the logo to scroll the feed to top.
  const [scrollToTopKey, setScrollToTopKey] = useState(0);
  const onLogoPress = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    setScrollToTopKey((k) => k + 1);
  }, []);

  const headerSlot = (
    <Surface variant="glass" className="border-b border-subtle">
      <SafeAreaView edges={["top"]}>
        <View className="flex-row items-center px-lg py-md">
          <Pressable
            onPress={onLogoPress}
            accessibilityRole="button"
            accessibilityLabel="Scroll feed to top"
            hitSlop={6}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
            })}
          >
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
              style={{ marginLeft: 12 }}
            >
              xMind
            </Text>
          </Pressable>
          <IconButton
            accessibilityLabel="Refresh feed"
            variant="ghost"
            onPress={() => refetchPosts()}
          >
            <Feather name="refresh-cw" size={18} color={colors.text.primary} />
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
        scrollToTopKey={scrollToTopKey}
        ListHeaderComponent={
          <View>
            <View className="px-base mt-sm">
              <PostComposer />
            </View>
            <TrendingRail />
          </View>
        }
      />
    </View>
  );
}