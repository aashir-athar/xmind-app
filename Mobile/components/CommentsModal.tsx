import React, { memo, useCallback } from "react";
import { Modal, Platform, Pressable, TextInput, View } from "react-native";
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
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { formatDate } from "@/utils/formatter";
import type { Comment, Post } from "@/types";

export interface CommentsModalProps {
  selectedPost: Post | null;
  onClose: () => void;
}

/**
 * Comments sheet.
 * Shows the parent post for context, then a FlashList of comments and
 * a sticky composer at the bottom. KeyboardAvoidingView keeps the
 * composer above the keyboard on both platforms.
 *
 * Psychology lever:
 *  Anchored social context. Showing "Replying to @username" right
 *  above the composer reduces the cognitive jump from "what was that
 *  post about?" to "what should I write?" — small but measurable lift
 *  in reply-rate.
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
        onDelete={() => deleteComment(item._id)}
      />
    ),
    [currentUser, deleteComment]
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
          // Platform-aware: iOS lifts via `padding`, Android via `height`.
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
          style={{ flex: 1 }}
        >
          <Pressable onPress={(e) => e.stopPropagation()} style={{ flex: 1 }}>
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
              {/* IG-style handle bar — reads as draggable even though the
                  sheet uses a tap-scrim dismissal model in V1. */}
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
                {selectedPost && selectedPost.comments && selectedPost.comments.length > 0 ? (
                  <FlashList<Comment>
                    data={selectedPost.comments}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={{
                      paddingHorizontal: spacing.lg,
                      paddingTop: spacing.md,
                      paddingBottom: spacing.md,
                    }}
                    showsVerticalScrollIndicator={false}
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
                    alignItems: "flex-end",
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
                  <View
                    style={{
                      flex: 1,
                      borderRadius: radii.xl,
                      backgroundColor: colors.surface.secondary,
                      paddingHorizontal: spacing.base,
                      paddingVertical: 8,
                      minHeight: 44,
                      maxHeight: 120,
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: colors.border.subtle,
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
                        textAlignVertical: "center",
                      }}
                    />
                  </View>
                  <Pressable
                    onPress={handleSubmit}
                    disabled={!commentText.trim() || isCreatingComment}
                    accessibilityRole="button"
                    accessibilityLabel="Send reply"
                    style={{
                      width: 44,
                      height: 44,
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
          </Pressable>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

interface CommentRowProps {
  comment: Comment;
  canDelete: boolean;
  onDelete: () => void;
}

function CommentRowImpl({ comment, canDelete, onDelete }: CommentRowProps) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ flexDirection: "row", gap: spacing.md, paddingVertical: spacing.sm }}>
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
      </View>
    </View>
  );
}
const CommentRow = memo(CommentRowImpl);

export const CommentsModal = memo(CommentsModalImpl);
CommentsModal.displayName = "CommentsModal";

export default CommentsModal;
