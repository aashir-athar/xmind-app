import React, { memo, useCallback } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import { Feather } from "@expo/vector-icons";

import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { Surface } from "@/components/ui/Surface";
import { Text } from "@/components/ui/Text";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { useTheme } from "@/hooks/useTheme";
import { useComments } from "@/hooks/useComments";
import { useCommentsForPost } from "@/hooks/useCommentsForPost";
import { useCommentLike } from "@/hooks/useCommentLike";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { formatDate } from "@/utils/formatter";
import type { Comment, Post } from "@/types";

export interface CommentsModalProps {
  selectedPost: Post | null;
  onClose: () => void;
}

/**
 * Comments sheet.
 *
 * Loads the full comment list lazily via `useCommentsForPost` because the
 * feed payload only ships `commentCount` (a `$size` projection) — keeping
 * every feed page small. The modal opens, the comments fetch, the user
 * sees a skeleton then content. Composer at the bottom uses
 * `react-native-keyboard-controller` so it sits cleanly above the keyboard
 * on both platforms.
 *
 * Psychology lever:
 *  Anchored social context. Showing "Replying to @username" right above
 *  the composer reduces the cognitive jump from "what was that post about?"
 *  to "what should I write?" — small but measurable lift in reply-rate.
 */
function CommentsModalImpl({ selectedPost, onClose }: CommentsModalProps) {
  const { colors, spacing, radii } = useTheme();
  const { currentUser } = useCurrentUser();

  const {
    commentText,
    setCommentText,
    createComment,
    deleteComment,
    isCreatingComment,
  } = useComments();

  // Fetch the actual comment list for this post. Cached at the query
  // level so reopening the same post is instant.
  const { comments, isLoading: commentsLoading } = useCommentsForPost(
    selectedPost?._id ?? null
  );
  const { toggleLike: toggleCommentLike } = useCommentLike(
    selectedPost?._id ?? null
  );

  const handleClose = useCallback(() => {
    onClose();
    setCommentText("");
  }, [onClose, setCommentText]);

  const handleSubmit = useCallback(() => {
    if (!selectedPost || !commentText.trim()) return;
    createComment(selectedPost._id);
  }, [commentText, createComment, selectedPost]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Comment>) => (
      <CommentRow
        comment={item}
        canDelete={!!currentUser && item.user._id === currentUser._id}
        currentUserId={currentUser?._id ?? null}
        onDelete={() => deleteComment(item._id)}
        onLike={() => toggleCommentLike(item._id)}
      />
    ),
    [currentUser, deleteComment, toggleCommentLike]
  );

  const keyExtractor = useCallback((c: Comment) => c._id, []);

  return (
    <Modal
      visible={!!selectedPost}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: colors.overlay.scrim }}>
        <Pressable
          accessibilityLabel="Dismiss replies"
          onPress={handleClose}
          style={{ flex: 1 }}
        />
        <KeyboardAvoidingView
          // iOS uses `padding`, Android uses `height` — RN's documented split.
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
          style={{ flex: 1 }}
        >
          {/* No `Pressable` wrapper here on purpose — wrapping the sheet
              in a Pressable swallows FlashList scroll gestures (Pressable's
              gesture detector wins over child scrollables on Android).
              The scrim Pressable above handles outside-tap dismissal as a
              sibling, so propagation isn't an issue. */}
            <Surface
              variant="solid"
              style={{
                flex: 1,
                borderTopLeftRadius: radii.xxl,
                borderTopRightRadius: radii.xxl,
                overflow: "hidden",
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderColor: colors.border.subtle,
              }}
            >
              {/* IG-style handle bar */}
              <View
                style={{
                  alignItems: "center",
                  paddingTop: spacing.sm,
                  paddingBottom: spacing.xs,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: colors.border.strong,
                  }}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border.subtle,
                  gap: spacing.md,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text variant="title" tone="primary">
                    Replies
                  </Text>
                  {selectedPost ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Text variant="caption" tone="tertiary">
                        Replying to
                      </Text>
                      <Text variant="caption" tone="tint" weight="700">
                        @{selectedPost.user.username}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <IconButton accessibilityLabel="Close" onPress={handleClose} variant="filled">
                  <Feather name="x" size={18} color={colors.text.primary} />
                </IconButton>
              </View>

              {selectedPost ? (
                <View
                  style={{
                    paddingHorizontal: spacing.lg,
                    paddingTop: spacing.md,
                    paddingBottom: spacing.md,
                    flexDirection: "row",
                    gap: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border.subtle,
                  }}
                >
                  <Avatar
                    source={selectedPost.user.profilePicture}
                    name={`${selectedPost.user.firstName} ${selectedPost.user.lastName}`}
                    size={36}
                  />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Text variant="subtitle" tone="primary" numberOfLines={1}>
                        {selectedPost.user.firstName} {selectedPost.user.lastName}
                      </Text>
                      {selectedPost.user.verified ? <VerifiedBadge size={14} /> : null}
                    </View>
                    <Text variant="bodySm" tone="secondary" numberOfLines={4}>
                      {selectedPost.content}
                    </Text>
                  </View>
                </View>
              ) : null}

              <View style={{ flex: 1 }}>
                {commentsLoading ? (
                  <View
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ActivityIndicator color={colors.tint.primary} />
                  </View>
                ) : comments.length > 0 ? (
                  <FlashList<Comment>
                    data={comments}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={{
                      paddingHorizontal: spacing.lg,
                      paddingTop: spacing.md,
                      paddingBottom: spacing.md,
                    }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  />
                ) : (
                  <EmptyState
                    icon={<Feather name="message-square" size={26} color={colors.tint.primary} />}
                    title="Be the first to reply"
                    description="A short, kind reply goes further than a clever one."
                  />
                )}
              </View>

              <SafeAreaView edges={["bottom"]}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.sm,
                    paddingHorizontal: spacing.base,
                    paddingTop: spacing.sm,
                    paddingBottom: spacing.sm,
                    borderTopWidth: 1,
                    borderTopColor: colors.border.subtle,
                    backgroundColor: colors.bg.canvas,
                  }}
                >
                  <Avatar
                    source={currentUser?.profilePicture}
                    name={`${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`}
                    size={32}
                  />
                  {/* The TextInput needs an explicit minHeight + flex: 1 so
                      multiline lays out correctly inside the row. The earlier
                      version collapsed to 0 height because the parent had
                      justifyContent: "center" with no inherent height. */}
                  <View
                    style={{
                      flex: 1,
                      borderRadius: radii.xl,
                      backgroundColor: colors.surface.secondary,
                      paddingHorizontal: spacing.base,
                      paddingVertical: 6,
                      minHeight: 40,
                      maxHeight: 120,
                      borderWidth: 1,
                      borderColor: colors.border.subtle,
                      justifyContent: "center",
                    }}
                  >
                    <TextInput
                      value={commentText}
                      onChangeText={setCommentText}
                      placeholder={
                        selectedPost
                          ? `Reply to @${selectedPost.user.username}`
                          : "Add a thoughtful reply"
                      }
                      placeholderTextColor={colors.text.tertiary}
                      multiline
                      style={{
                        fontSize: 15,
                        lineHeight: 20,
                        color: colors.text.primary,
                        minHeight: 24,
                        padding: 0,
                      }}
                    />
                  </View>
                  <Pressable
                    onPress={handleSubmit}
                    disabled={!commentText.trim() || isCreatingComment}
                    accessibilityRole="button"
                    accessibilityLabel="Send reply"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: radii.pill,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: commentText.trim()
                        ? colors.tint.primary
                        : colors.surface.sunken,
                    }}
                  >
                    <Feather
                      name="send"
                      size={18}
                      color={commentText.trim() ? colors.text.onTint : colors.text.tertiary}
                    />
                  </Pressable>
                </View>
              </SafeAreaView>
            </Surface>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

interface CommentRowProps {
  comment: Comment;
  canDelete: boolean;
  currentUserId: string | null;
  onDelete: () => void;
  onLike: () => void;
}

function CommentRowImpl({
  comment,
  canDelete,
  currentUserId,
  onDelete,
  onLike,
}: CommentRowProps) {
  const { colors, spacing } = useTheme();
  const liked = !!currentUserId && (comment.likes ?? []).includes(currentUserId);
  const likeCount = comment.likes?.length ?? 0;

  return (
    <View
      style={{
        flexDirection: "row",
        gap: spacing.md,
        paddingVertical: spacing.sm,
      }}
    >
      <Avatar
        source={comment.user.profilePicture}
        name={`${comment.user.firstName} ${comment.user.lastName}`}
        size={36}
      />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
          <Text variant="label" tone="primary" numberOfLines={1}>
            {comment.user.firstName} {comment.user.lastName}
          </Text>
          {comment.user.verified ? <VerifiedBadge size={12} /> : null}
          <Text variant="caption" tone="tertiary">
            · {formatDate(comment.createdAt)}
          </Text>
          {canDelete ? (
            <Pressable
              onPress={onDelete}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Delete comment"
              style={{ marginLeft: "auto" }}
            >
              <Feather name="trash-2" size={14} color={colors.text.tertiary} />
            </Pressable>
          ) : null}
        </View>
        <Text variant="body" tone="primary" style={{ marginTop: 2 }}>
          {comment.content}
        </Text>
        {/* Like + reply row — like is wired; reply opens the composer
            with a "Replying to @username" prefill (see useComments). */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.lg,
            marginTop: 6,
          }}
        >
          <Pressable
            onPress={onLike}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={liked ? "Unlike comment" : "Like comment"}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Feather
              name="heart"
              size={14}
              color={liked ? colors.tint.danger : colors.text.tertiary}
            />
            {likeCount > 0 ? (
              <Text
                variant="caption"
                tone={liked ? "danger" : "tertiary"}
                weight="600"
              >
                {likeCount}
              </Text>
            ) : null}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
const CommentRow = memo(CommentRowImpl);

export const CommentsModal = memo(CommentsModalImpl);
CommentsModal.displayName = "CommentsModal";

export default CommentsModal;
