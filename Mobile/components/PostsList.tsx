import React, { memo, useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import { Feather } from "@expo/vector-icons";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
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
}

/**
 * Feed renderer.
 *
 * Why FlashList:
 *  - Recycles cells aggressively. On a 2GB Android device that's the
 *    difference between 60fps scroll and dropped frames after ~20 posts.
 *
 * Why no per-item entrance animation:
 *  - The previous implementation animated each card with a 100ms-per-index
 *    delay. On a list of 25 ranked posts that meant the last card animated
 *    in 2.5s after mount and any item recycled mid-scroll re-played its
 *    entrance — a continuous flicker. We removed it. The list now feels
 *    like the OS instead of a keynote.
 */
function PostsListImpl({ posts: customPosts, username, ListHeaderComponent }: PostsListProps) {
  const { colors, spacing } = useTheme();
  const { currentUser } = useCurrentUser();
  const {
    posts: fetchedPosts,
    isLoading,
    error,
    refetch,
    toggleLike,
    deletePost,
    checkIsLiked,
  } = usePosts(username);

  const posts = customPosts ?? fetchedPosts;

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const selectedPost = useMemo(
    () =>
      selectedPostId
        ? posts.find((p: Post) => p._id === selectedPostId) ?? null
        : null,
    [selectedPostId, posts]
  );

  const handleLike = useCallback(
    (postId: string) => toggleLike(postId),
    [toggleLike]
  );
  const handleDelete = useCallback(
    (postId: string) => deletePost(postId),
    [deletePost]
  );
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: 140 }}
        // Saves memory on long sessions; cells off-screen are detached.
        removeClippedSubviews
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
