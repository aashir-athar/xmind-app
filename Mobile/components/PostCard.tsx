import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  type GestureResponderEvent,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { AntDesign, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/hooks/useTheme";
import { formatDate, formatNumber } from "@/utils/formatter";
import type { Post, User } from "@/types";

import ImageModal from "./ImageModal";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "./CustomAlert";

export interface PostCardProps {
  post: Post;
  /** Liked-by-current-user flag (drives the heart animation). */
  isLiked?: boolean;
  /** Resolved current user (used to gate the delete affordance). */
  currentUser: User | null | undefined;
  onLike: (postId: string) => void;
  onComment: (post: Post) => void;
  onDelete: (postId: string) => void;
}

/**
 * One row of the feed.
 *
 * Psychology notes:
 *  - Hierarchy: avatar → name → content → media → actions. The eye lands
 *    on the author, then content. Action bar is intentionally lower
 *    contrast so it never competes with the message itself.
 *  - Like animation pulses on tap (variable-reward dopamine cue) but
 *    deliberately stops short of bouncy theatrics — every interaction
 *    in the app shouldn't feel like a slot machine.
 *
 * Performance:
 *  - Memoised at the boundary; renders only when its prop identity
 *    changes (which the parent guarantees via stable callbacks).
 *  - All handlers are useCallback so they don't bust child memo() peers.
 */
function PostCardImpl({
  post,
  isLiked,
  currentUser,
  onLike,
  onComment,
  onDelete,
}: PostCardProps) {
  const { colors, spacing, radii } = useTheme();
  const router = useRouter();
  const { showDeleteConfirmation, alertConfig, isVisible, hideAlert } =
    useCustomAlert();

  const [imageOpen, setImageOpen] = useState(false);
  const isOwn = !!currentUser && post.user._id === currentUser._id;

  // Heart pulse — single shared value, lightweight, UI-thread only.
  const heartScale = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleLike = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    heartScale.value = withSequence(
      withTiming(1.25, { duration: 120 }),
      withTiming(1, { duration: 160 })
    );
    onLike(post._id);
  }, [heartScale, onLike, post._id]);

  const handleComment = useCallback(() => {
    onComment(post);
  }, [onComment, post]);

  const handleDelete = useCallback(() => {
    showDeleteConfirmation(
      "Delete this post?",
      "It'll be gone from your feed and from anyone who's already seen it.",
      () => onDelete(post._id)
    );
  }, [onDelete, post._id, showDeleteConfirmation]);

  const navigateToProfile = useCallback(() => {
    if (isOwn) router.push("/(tabs)/profile");
    else
      router.push({
        pathname: "/user-profile",
        params: { userId: post.user._id, username: post.user.username },
      });
  }, [isOwn, post.user._id, post.user.username, router]);

  // Tokenised hashtag rendering — split once per content change.
  const contentNodes = useMemo(() => {
    if (!post.content) return null;
    const tokens = post.content.split(/(\s+)/);
    return tokens.map((token, i) => {
      const tagMatch = token.match(/^#[A-Za-z0-9_]+$/);
      if (tagMatch) {
        const tag = tagMatch[0];
        return (
          <Text
            key={`t-${i}`}
            tone="tint"
            weight="600"
            onPress={() =>
              router.push({ pathname: "/hashtag-posts", params: { hashtag: tag } })
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
      <Card
        variant="solid"
        className="mx-base mb-md p-base border border-subtle"
      >
        <View className="flex-row gap-md">
          <Pressable
            onPress={navigateToProfile}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Open profile of ${post.user.firstName}`}
          >
            <Avatar
              source={post.user.profilePicture}
              name={`${post.user.firstName} ${post.user.lastName}`}
              size={44}
            />
          </Pressable>

          <View className="flex-1 min-w-0">
            {/* Identity row */}
            <View className="flex-row items-center justify-between gap-sm">
              <Pressable
                onPress={navigateToProfile}
                className="flex-1 flex-row items-center gap-xs"
              >
                <Text variant="subtitle" tone="primary" numberOfLines={1}>
                  {post.user.firstName} {post.user.lastName}
                </Text>
                {post.user.verified ? (
                  <View
                    className="w-[16px] h-[16px] rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.tint.primary }}
                  >
                    <MaterialCommunityIcons
                      name="check"
                      size={10}
                      color={colors.text.onTint}
                    />
                  </View>
                ) : null}
                <Text variant="bodySm" tone="tertiary" numberOfLines={1}>
                  @{post.user.username} · {formatDate(post.createdAt)}
                </Text>
              </Pressable>

              {isOwn ? (
                <Pressable
                  onPress={handleDelete}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Delete post"
                  className="w-[32px] h-[32px] rounded-pill items-center justify-center"
                >
                  <Feather name="trash-2" size={16} color={colors.text.tertiary} />
                </Pressable>
              ) : null}
            </View>

            {/* Content */}
            {contentNodes ? (
              <Text variant="body" tone="primary" className="mt-xs">
                {contentNodes}
              </Text>
            ) : null}

            {/* Media */}
            {post.image ? (
              <Pressable
                onPress={() => setImageOpen(true)}
                className="mt-md rounded-base overflow-hidden bg-surface-secondary"
              >
                <Image
                  source={{ uri: post.image }}
                  style={{ width: "100%", aspectRatio: 16 / 10 }}
                  resizeMode="cover"
                />
              </Pressable>
            ) : null}

            {/* Action bar */}
            <View className="mt-md flex-row justify-between pr-lg">
              <ActionPill
                icon={<Feather name="message-circle" size={18} color={colors.text.tertiary} />}
                label={formatNumber(post.comments?.length || 0)}
                onPress={handleComment}
                accessibilityLabel="Open comments"
              />
              <ActionPill
                icon={
                  <Animated.View style={heartStyle}>
                    {isLiked ? (
                      <AntDesign name="heart" size={18} color={colors.tint.primary} />
                    ) : (
                      <Feather name="heart" size={18} color={colors.text.tertiary} />
                    )}
                  </Animated.View>
                }
                label={formatNumber(post.likes?.length || 0)}
                onPress={handleLike}
                emphasised={isLiked}
                accessibilityLabel={isLiked ? "Unlike" : "Like"}
              />
              <ActionPill
                icon={<Feather name="share" size={18} color={colors.text.tertiary} />}
                onPress={() => undefined}
                accessibilityLabel="Share"
              />
            </View>
          </View>
        </View>
      </Card>

      <ImageModal
        isVisible={imageOpen}
        onClose={() => setImageOpen(false)}
        imageUrl={post.image || ""}
        imageTitle="Post image"
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

interface ActionPillProps {
  icon: React.ReactNode;
  label?: string;
  onPress: (e: GestureResponderEvent) => void;
  emphasised?: boolean;
  accessibilityLabel: string;
}

function ActionPillImpl({ icon, label, onPress, emphasised, accessibilityLabel }: ActionPillProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="flex-row items-center gap-xs px-sm h-[32px] rounded-pill"
    >
      {icon}
      {label != null ? (
        <Text variant="bodySm" tone={emphasised ? "tint" : "tertiary"} weight="600">
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}
const ActionPill = memo(ActionPillImpl);
ActionPill.displayName = "ActionPill";

/** Memo with custom equality on the slim set of fields that change. */
export const PostCard = memo(PostCardImpl, (prev, next) => {
  return (
    prev.post._id === next.post._id &&
    prev.post.likes?.length === next.post.likes?.length &&
    prev.post.comments?.length === next.post.comments?.length &&
    prev.post.image === next.post.image &&
    prev.post.content === next.post.content &&
    prev.isLiked === next.isLiked &&
    prev.currentUser?._id === next.currentUser?._id
  );
});
PostCard.displayName = "PostCard";

export default PostCard;
