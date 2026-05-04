/**
 * Reels — IG-style media-only feed.
 *
 * Lever: pattern-completion + endless-scroll dopamine pacing.
 *  Filtering the cached feed to image-only posts gives users the
 *  visual-first browsing mode they expect from IG/Watch without
 *  introducing a new content type backend-side. When a Reels backend
 *  arrives (short-video schema), this screen is the drop-in renderer.
 *
 * v1: 3-column grid of square media. Tapping a tile opens the
 *  ImageModal (re-uses the existing post-image lightbox) — a future
 *  PostDetail screen will replace that with a full-bleed viewer.
 */
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, RefreshControl, View } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import { Feather } from "@expo/vector-icons";

import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import ImageModal from "@/components/ImageModal";
import { useFeedRanking } from "@/hooks/useFeedRanking";
import { useTheme } from "@/hooks/useTheme";
import type { Post } from "@/types";

const COLS = 3;

interface GridRow {
  id: string;
  posts: (Post | null)[];
}

export default function ReelsScreen() {
  const { colors, spacing } = useTheme();
  const {
    posts,
    isLoading,
    refetch,
    isRefetching,
  } = useFeedRanking({
    useAdvancedAlgorithm: false,
    maxPosts: 80,
  });

  const mediaPosts = useMemo(
    () => (posts ?? []).filter((p) => !!p.image),
    [posts]
  );

  const rows = useMemo<GridRow[]>(() => {
    const out: GridRow[] = [];
    for (let i = 0; i < mediaPosts.length; i += COLS) {
      const slice = mediaPosts.slice(i, i + COLS);
      while (slice.length < COLS) slice.push(null as unknown as Post);
      out.push({
        id: slice[0]?._id ?? `row-${i}`,
        posts: slice,
      });
    }
    return out;
  }, [mediaPosts]);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const renderRow = useCallback(
    ({ item }: ListRenderItemInfo<GridRow>) => (
      <View style={{ flexDirection: "row" }}>
        {item.posts.map((p, idx) => (
          <Pressable
            key={p?._id ?? `empty-${idx}`}
            onPress={() => p?.image && setPreviewUrl(p.image)}
            disabled={!p?.image}
            style={{ flex: 1, aspectRatio: 1, padding: 1 }}
          >
            {p?.image ? (
              <ExpoImage
                source={{ uri: p.image }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={120}
              />
            ) : (
              <View style={{ flex: 1, backgroundColor: colors.surface.sunken }} />
            )}
          </Pressable>
        ))}
      </View>
    ),
    [colors.surface.sunken]
  );

  const keyExtractor = useCallback((row: GridRow) => row.id, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.canvas }}>
      <SafeAreaView edges={["top"]}>
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.border.subtle,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <Feather name="play" size={22} color={colors.tint.primary} />
          <Text variant="headline" tone="primary">
            Reels
          </Text>
        </View>
      </SafeAreaView>

      {isLoading ? (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            padding: 1,
            opacity: 0.7,
          }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <View key={i} style={{ width: "33.3%", aspectRatio: 1, padding: 1 }}>
              <Skeleton width="100%" height={300} radius={0} />
            </View>
          ))}
        </View>
      ) : mediaPosts.length === 0 ? (
        <EmptyState
          icon={<Feather name="image" size={28} color={colors.tint.primary} />}
          title="No reels yet"
          description="Once people start posting photos, you'll find them here as a fast-scrolling grid."
        />
      ) : (
        <FlashList<GridRow>
          data={rows}
          renderItem={renderRow}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.tint.primary}
              colors={[colors.tint.primary]}
            />
          }
        />
      )}

      <ImageModal
        isVisible={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        imageUrl={previewUrl ?? ""}
        imageTitle="Reel"
      />
    </View>
  );
}
