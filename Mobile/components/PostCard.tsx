/**
 * PostCard — FB + IG + Twitter hybrid feed cell.
 *
 * Lever: peak-end rule + variable-reward dopamine.
 *  Double-tap to like is the IG ritual: the satisfying heart pop is
 *  the peak emotional moment of casual scrolling. We keep it big,
 *  punchy, and brief — never lingering long enough to feel theatrical.
 *
 * Visual blueprint:
 *  - Identity row at top: avatar + display name + verified + handle
 *    (IG/Twitter). FB-style overflow menu on the right.
 *  - Optional image lives full-bleed inside the card with a tall
 *    aspect ratio (1:1 default for image posts, 16:10 for landscape).
 *    Double-tap on the image fires the like; a heart bursts on top.
 *  - Action row underneath: Like, Comment, Share — IG order. Counts
 *    are bold under the icons, FB-style. Twitter's repeat is folded
 *    into the share menu (off-screen for now).
 *  - "Liked by X and Y others" line is FB-style social proof.
 *
 * Performance:
 *  - memo at the boundary; renders only when its narrow set of
 *    props (likes count, comment count, image, content) changes.
 *  - Heart pop runs on the UI thread via Reanimated worklets.
 *  - expo-image handles decode off the JS thread + disk cache.
 */
import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Pressable,
  type GestureResponderEvent,
  StyleSheet,
  View,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { Avatar } from "@/components/ui/Avatar";
import { Text } from "@/components/ui/Text";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { useTheme } from "@/hooks/useTheme";
import { useBookmarksStore } from "@/stores/useBookmarksStore";
import { formatDate, formatNumber } from "@/utils/formatter";
import type { Post, User } from "@/types";

import ImageModal from "./ImageModal";
import ShareToChatSheet from "./ShareToChatSheet";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "./CustomAlert";

export interface PostCardProps {
  post: Post;
  isLiked?: boolean;
  currentUser: User | null | undefined;
  onLike: (postId: string) => void;
  onComment: (post: Post) => void;
  onDelete: (postId: string) => void;
  onMore?: (post: Post) => void;
}

function PostCardImpl({
  post,
  isLiked,
  currentUser,
  onLike,
  onComment,
  onDelete,
  onMore,
}: PostCardProps) {
  const { colors, spacing, radii } = useTheme();
  const router = useRouter();
  const { showDeleteConfirmation, alertConfig, isVisible, hideAlert } =
    useCustomAlert();

  const [imageOpen, setImageOpen] = useState(false);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const isOwn = !!currentUser && post.user._id === currentUser._id;
  const commentCount = post.commentCount ?? post.comments?.length ?? 0;
  const likeCount = post.likes?.length ?? 0;

  // Heart pop on the action button.
  const heartScale = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  // Big-heart burst on top of the image (IG double-tap).
  const burstScale = useSharedValue(0);
  const burstOpacity = useSharedValue(0);
  const burstStyle = useAnimatedStyle(() => ({
    transform: [{ scale: burstScale.value }],
    opacity: burstOpacity.value,
  }));

  const triggerLikeAnim = useCallback(() => {
    heartScale.value = withSequence(
      withTiming(1.3, { duration: 120 }),
      withTiming(1, { duration: 160 })
    );
  }, [heartScale]);

  const handleLike = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    triggerLikeAnim();
    onLike(post._id);
  }, [onLike, post._id, triggerLikeAnim]);

  const triggerHeartBurst = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    burstScale.value = 0;
    burstOpacity.value = 0;
    burstScale.value = withSequence(
      withSpring(1, { damping: 10, stiffness: 200, mass: 0.7 }),
      withTiming(1, { duration: 240 }),
      withTiming(1.1, { duration: 200 })
    );
    burstOpacity.value = withSequence(
      withTiming(1, { duration: 120 }),
      withTiming(1, { duration: 240 }),
      withTiming(0, { duration: 220 })
    );
    if (!isLiked) onLike(post._id);
  }, [burstOpacity, burstScale, isLiked, onLike, post._id]);

  const doubleTap = useMemo(
    () =>
      Gesture.Tap()
        .numberOfTaps(2)
        .maxDuration(280)
        .onStart(() => {
          "worklet";
          runOnJS(triggerHeartBurst)();
        }),
    [triggerHeartBurst]
  );

  const singleTap = useMemo(
    () =>
      Gesture.Tap().numberOfTaps(1).maxDuration(280).onStart(() => {
        "worklet";
        runOnJS(setImageOpen)(true);
      }),
    []
  );

  const imageGesture = useMemo(
    () => Gesture.Exclusive(doubleTap, singleTap),
    [doubleTap, singleTap]
  );

  const handleComment = useCallback(() => {
    onComment(post);
  }, [onComment, post]);

  const handleDelete = useCallback(() => {
    showDeleteConfirmation(
      "Delete this post?",
      "It'll disappear from your feed and from anyone who's already seen it.",
      () => onDelete(post._id)
    );
  }, [onDelete, post._id, showDeleteConfirmation]);

  const handleMore = useCallback(() => {
    if (onMore) {
      Haptics.selectionAsync().catch(() => undefined);
      onMore(post);
    }
  }, [onMore, post]);

  // Share opens an in-app friend picker (the IG / Twitter pattern). The
  // sheet itself has a "Share elsewhere" footer that fans out to the
  // OS share sheet for users who want WhatsApp / Messages / AirDrop.
  const handleShare = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    setShareSheetOpen(true);
  }, []);

  // Bookmarks — local-first via Zustand + AsyncStorage. The contract
  // (toggle, isBookmarked) lets a future server-side bookmarks API drop
  // in by replacing the store implementation, with no call-site changes.
  const isBookmarked = useBookmarksStore((s) => s.postIds.has(post._id));
  const toggleBookmark = useBookmarksStore((s) => s.toggle);
  const handleBookmark = useCallback(async () => {
    Haptics.selectionAsync().catch(() => undefined);
    await toggleBookmark(post._id);
  }, [post._id, toggleBookmark]);

  const navigateToProfile = useCallback(() => {
    if (isOwn) router.push("/(tabs)/profile");
    else
      router.push({
        pathname: "/user-profile",
        params: { userId: post.user._id, username: post.user.username },
      });
  }, [isOwn, post.user._id, post.user.username, router]);

  const contentNodes = useMemo(() => {
    if (!post.content) return null;
    const tokens = post.content.split(/(\s+)/);
    return tokens.map((token, i) => {
      const tagMatch = token.match(/^#[A-Za-z0-9_]+$/);
      const mentionMatch = token.match(/^@[A-Za-z0-9_]+$/);
      if (tagMatch) {
        const tag = tagMatch[0];
        return (
          <Text
            key={`t-${i}`}
            tone="tint"
            weight="700"
            onPress={() =>
              router.push({ pathname: "/hashtag-posts", params: { hashtag: tag } })
            }
          >
            {token}
          </Text>
        );
      }
      if (mentionMatch) {
        const handle = mentionMatch[0].slice(1).toLowerCase();
        return (
          <Text
            key={`t-${i}`}
            tone="accent"
            weight="600"
            onPress={() =>
              router.push({
                pathname: "/user-profile",
                params: { userId: "", username: handle },
              })
            }
          >
            {token}
          </Text>
        );
      }
      return (
        <Text key={`t-${i}`} tone="primary">
          {token}
        </Text>
      );
    });
  }, [post.content, router]);

  return (
    <>
      <View
        style={{
          backgroundColor: colors.surface.primary,
          marginBottom: spacing.sm,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border.subtle,
        }}
      >
        {/* Identity row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: spacing.base,
            paddingTop: spacing.md,
            gap: spacing.md,
          }}
        >
          <Pressable
            onPress={navigateToProfile}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Open profile of ${post.user.firstName}`}
          >
            <Avatar
              source={post.user.profilePicture}
              name={`${post.user.firstName} ${post.user.lastName}`}
              size={40}
            />
          </Pressable>

          <Pressable
            onPress={navigateToProfile}
            style={{ flex: 1, minWidth: 0 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
              <Text variant="subtitle" tone="primary" numberOfLines={1}>
                {post.user.firstName} {post.user.lastName}
              </Text>
              {post.user.verified ? <VerifiedBadge size={14} /> : null}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text variant="caption" tone="tertiary" numberOfLines={1}>
                @{post.user.username}
              </Text>
              <Text variant="caption" tone="tertiary">·</Text>
              <Text variant="caption" tone="tertiary">
                {formatDate(post.createdAt)}
              </Text>
            </View>
          </Pressable>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {onMore ? (
              <Pressable
                onPress={handleMore}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="More options"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="more-horizontal" size={20} color={colors.text.secondary} />
              </Pressable>
            ) : null}
            {isOwn ? (
              <Pressable
                onPress={handleDelete}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Delete post"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="trash-2" size={16} color={colors.text.tertiary} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Content (text-only or above image) */}
        {contentNodes ? (
          <View
            style={{
              paddingHorizontal: spacing.base,
              paddingTop: spacing.sm,
            }}
          >
            <Text variant="body" tone="primary">
              {contentNodes}
            </Text>
          </View>
        ) : null}

        {/* Media — full bleed, double-tap to like (IG ritual) */}
        {post.image ? (
          <View style={{ marginTop: spacing.md }}>
            <GestureDetector gesture={imageGesture}>
              <View
                style={{
                  backgroundColor: colors.surface.sunken,
                  position: "relative",
                }}
              >
                <ExpoImage
                  source={{ uri: post.image }}
                  style={{ width: "100%", aspectRatio: 1 }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={140}
                  recyclingKey={post._id}
                />
                <Animated.View
                  pointerEvents="none"
                  style={[
                    {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                    burstStyle,
                  ]}
                >
                  <AntDesign name="heart" size={96} color="#FFFFFF" />
                </Animated.View>
              </View>
            </GestureDetector>
          </View>
        ) : null}

        {/* Action bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: spacing.base,
            paddingTop: spacing.md,
            paddingBottom: spacing.sm,
            gap: spacing.lg,
          }}
        >
          <Action
            onPress={handleLike}
            accessibilityLabel={isLiked ? "Unlike" : "Like"}
          >
            <Animated.View style={heartStyle}>
              <AntDesign
                name="heart"
                size={24}
                color={isLiked ? colors.tint.primary : colors.text.primary}
              />
            </Animated.View>
          </Action>
          <Action
            onPress={handleComment}
            accessibilityLabel="Open comments"
          >
            <Feather name="message-circle" size={24} color={colors.text.primary} />
          </Action>
          <Action onPress={handleShare} accessibilityLabel="Share">
            <Feather name="send" size={22} color={colors.text.primary} />
          </Action>
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={handleBookmark}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={isBookmarked ? "Remove from saved" : "Save post"}
          >
            <Feather
              name="bookmark"
              size={22}
              color={isBookmarked ? colors.tint.primary : colors.text.primary}
              // Filled effect via tint colour swap — matches the heart
              // pattern (single icon, colour flip on state change).
              style={{ opacity: isBookmarked ? 1 : 0.95 }}
            />
          </Pressable>
        </View>

        {/* Counts row — FB social-proof style */}
        {likeCount > 0 || commentCount > 0 ? (
          <View
            style={{
              paddingHorizontal: spacing.base,
              paddingBottom: spacing.md,
              gap: 2,
            }}
          >
            {likeCount > 0 ? (
              <Text variant="bodySm" tone="primary" weight="700">
                {formatNumber(likeCount)} {likeCount === 1 ? "like" : "likes"}
              </Text>
            ) : null}
            {commentCount > 0 ? (
              <Pressable onPress={handleComment} hitSlop={4}>
                <Text variant="bodySm" tone="tertiary">
                  View {commentCount === 1 ? "1 comment" : `all ${formatNumber(commentCount)} comments`}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View style={{ paddingBottom: spacing.md }} />
        )}
      </View>

      <ImageModal
        isVisible={imageOpen}
        onClose={() => setImageOpen(false)}
        imageUrl={post.image || ""}
        imageTitle="Post image"
      />

      <ShareToChatSheet
        post={shareSheetOpen ? post : null}
        onClose={() => setShareSheetOpen(false)}
      />

      {alertConfig ? (
        <CustomAlert
          visible={isVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          type={alertConfig.type}
          onDismiss={hideAlert}
        />
      ) : null}
    </>
  );
}

interface ActionProps {
  children: React.ReactNode;
  onPress: (e: GestureResponderEvent) => void;
  accessibilityLabel: string;
}

function ActionImpl({ children, onPress, accessibilityLabel }: ActionProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Pressable>
  );
}
const Action = memo(ActionImpl);
Action.displayName = "Action";

export const PostCard = memo(PostCardImpl, (prev, next) => {
  const prevComments = prev.post.commentCount ?? prev.post.comments?.length ?? 0;
  const nextComments = next.post.commentCount ?? next.post.comments?.length ?? 0;
  return (
    prev.post._id === next.post._id &&
    prev.post.likes?.length === next.post.likes?.length &&
    prevComments === nextComments &&
    prev.post.image === next.post.image &&
    prev.post.content === next.post.content &&
    prev.isLiked === next.isLiked &&
    prev.currentUser?._id === next.currentUser?._id &&
    prev.onMore === next.onMore
  );
});
PostCard.displayName = "PostCard";

export default PostCard;
