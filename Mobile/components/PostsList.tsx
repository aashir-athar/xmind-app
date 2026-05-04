import React, { memo, useCallback, useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, View } from "react-native";
import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import { Feather } from "@expo/vector-icons";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/hooks/useTheme";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import type { Post } from "@/types";

import CommentsModal from "./CommentsModal";
import PostCard from "./PostCard";

export interface PostsListProps {
  /** When provided, a custom posts array is rendered instead of fetched feed. */
  posts?: Post[];
  /** Restrict the fetch to one user's posts. */
  username?: string;
  /** Header rendered above the list (composer on home, banner on profile). */
  ListHeaderComponent?: React.ComponentType<unknown> | React.ReactElement | null;
  /**
   * Optional refresh handler. When omitted, the list uses the internal
   * `usePosts` refetch as the pull-to-refresh action.
   */
  onRefresh?: () => Promise<unknown> | void;
  /** Drives the spinner when the parent owns the refresh state. */
  refreshing?: boolean;
}

const PAGE_BOTTOM_INSET = 140;

/**
 * Feed renderer.
 *
 * Why FlashList: cell recycling on virtualised lists. Without it, a feed
 * of 100+ posts churns native views non-stop and the JS thread starves
 * the gesture handler. With it, scroll stays smooth on a 2 GB Android
 * device.
 *
 * `removeClippedSubviews` is intentionally OFF: FlashList already manages
 * its own recycling pool, and stacking RN's clipping on top causes flicker
 * when cells re-attach.
 *
 * Pull-to-refresh uses native `RefreshControl` because it's the muscle
 * memory every social app shares (Twitter, Facebook, Instagram). The
 * previous floating refresh button is gone — discoverability was fine,
 * but it added a layout element that fought with the tab bar.
 */
function PostsListImpl({
  posts: customPosts,
  username,
  ListHeaderComponent,
  onRefresh: externalOnRefresh,
  refreshing: externalRefreshing,
}: PostsListProps) {
  const { colors, spacing } = useTheme();
  const { currentUser } = useCurrentUser();
  const {
    posts: fetchedPosts,
    isLoading,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    toggleLike,
    deletePost,
    checkIsLiked,
  } = usePosts(username);

  const posts = customPosts ?? fetchedPosts;

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const selectedPost = useMemo(
    () =>
      selectedPostId ? posts.find((p) => p._id === selectedPostId) ?? null : null,
    [selectedPostId, posts]
  );

  const handleLike = useCallback((postId: string) => toggleLike(postId), [toggleLike]);
  const handleDelete = useCallback((postId: string) => deletePost(postId), [deletePost]);
  const handleComment = useCallback((post: Post) => setSelectedPostId(post._id), []);
  const handleCloseComments = useCallback(() => setSelectedPostId(null), []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Post>) => (
      <PostCard
        post={item}
        currentUser={currentUser}
        isLiked={checkIsLiked(item.likes, currentUser)}
        onLike={handleLike}
        onComment={handleComment}
        onDelete={handleDelete}
      />
    ),
    [checkIsLiked, currentUser, handleComment, handleDelete, handleLike]
  );

  const keyExtractor = useCallback((item: Post) => item._id, []);

  const handleEndReached = useCallback(() => {
    if (!customPosts && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [customPosts, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleRefresh = useCallback(async () => {
    if (externalOnRefresh) {
      await externalOnRefresh();
      return;
    }
    await refetch();
  }, [externalOnRefresh, refetch]);

  const refreshing = externalRefreshing ?? isRefetching;

  const ListFooterComponent = useMemo(
    () =>
      isFetchingNextPage ? (
        <View style={{ paddingVertical: spacing.lg, alignItems: "center" }}>
          <ActivityIndicator color={colors.tint.primary} />
        </View>
      ) : !hasNextPage && posts.length > 0 ? (
        <View style={{ paddingVertical: spacing.xl, alignItems: "center" }}>
          <Text variant="caption" tone="tertiary">
            You're all caught up
          </Text>
        </View>
      ) : null,
    [isFetchingNextPage, hasNextPage, posts.length, spacing.lg, spacing.xl, colors.tint.primary]
  );

  // Loading state — skeleton stack feels like content, not a spinner.
  if (isLoading && !customPosts) {
    return (
      <View style={{ paddingHorizontal: spacing.base, gap: spacing.md, marginTop: spacing.md }}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              gap: spacing.md,
              padding: spacing.base,
              borderRadius: 20,
              backgroundColor: colors.surface.primary,
              borderWidth: 1,
              borderColor: colors.border.subtle,
            }}
          >
            <Skeleton width={44} height={44} radius={22} />
            <View style={{ flex: 1, gap: spacing.sm }}>
              <Skeleton width="40%" height={12} />
              <Skeleton width="100%" height={12} />
              <Skeleton width="80%" height={12} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (error && !customPosts) {
    return (
      <EmptyState
        icon={<Feather name="wifi-off" size={28} color={colors.tint.danger} />}
        title="We couldn't reach the feed"
        description="Probably the network. Your drafts are safe — try again in a moment."
        action={<Button label="Try again" variant="primary" onPress={() => refetch()} />}
      />
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <EmptyState
        icon={<Feather name="feather" size={28} color={colors.tint.primary} />}
        title="Your feed is quiet"
        description="Follow a few people and post one thought. The feed fills out fast."
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlashList<Post>
        data={posts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: PAGE_BOTTOM_INSET }}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.6}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.tint.primary}
            colors={[colors.tint.primary]}
            progressBackgroundColor={colors.surface.raised}
          />
        }
      />

      {selectedPost ? (
        <CommentsModal selectedPost={selectedPost} onClose={handleCloseComments} />
      ) : null}
    </View>
  );
}

export const PostsList = memo(PostsListImpl);
PostsList.displayName = "PostsList";

export default PostsList;
