/**
 * PostMenu — overflow sheet for a single post.
 *
 * Architectural role:
 *  Modal-from-bottom sheet that gives the user explicit curation
 *  controls: hide this post, mute the author, report. Wires into
 *  `useFeedbackStore` so the choice survives cold starts and feeds
 *  the ranker's negative-feedback signal.
 *
 * Psychology lever:
 *  Locus of control. Even when the algorithm gets a post wrong, the
 *  user can shape the next one — a tiny moment of agency that
 *  measurably improves session length and reduces churn.
 */
import React, { memo, useCallback, useEffect } from "react";
import { Modal, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Surface } from "@/components/ui/Surface";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/hooks/useTheme";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { useFeedbackStore } from "@/stores/useFeedbackStore";
import type { Post } from "@/types";

export interface PostMenuProps {
  post: Post | null;
  onClose: () => void;
  /** When true, the menu shows the author-only set (Delete) instead of
   *  the moderation set (Not interested / Mute / Report). */
  isOwn?: boolean;
  /** Required when `isOwn` is true so the Delete option can fire. */
  onDelete?: (postId: string) => void;
}

interface MenuOption {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  description: string;
  destructive?: boolean;
  onPress: () => void;
}

function PostMenuImpl({ post, onClose, isOwn, onDelete }: PostMenuProps) {
  const { colors, spacing, radii } = useTheme();
  const open = useSharedValue(0);
  const visible = !!post;

  const markNotInterested = useFeedbackStore((s) => s.markNotInterested);
  const muteAuthor = useFeedbackStore((s) => s.muteAuthor);
  // Native alerts so the confirmation can stack over this modal sheet —
  // React Native does not support overlapping <Modal> components.
  const { showInfo, showSuccess, showDeleteConfirmation } = useCustomAlert({
    useNative: true,
  });

  useEffect(() => {
    open.value = withTiming(visible ? 1 : 0, { duration: 220 });
  }, [open, visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    opacity: open.value,
    transform: [{ translateY: 24 * (1 - open.value) }],
  }));

  const onNotInterested = useCallback(async () => {
    if (!post) return;
    Haptics.selectionAsync().catch(() => undefined);
    await markNotInterested(post._id);
    onClose();
    showSuccess("Got it", "We'll show fewer posts like this.");
  }, [markNotInterested, onClose, post, showSuccess]);

  const onMute = useCallback(async () => {
    if (!post) return;
    Haptics.selectionAsync().catch(() => undefined);
    await muteAuthor(post.user._id);
    onClose();
    showSuccess(
      "Muted",
      `Posts from @${post.user.username} won't appear in your feed.`
    );
  }, [muteAuthor, onClose, post, showSuccess]);

  const onReport = useCallback(() => {
    Haptics.selectionAsync().catch(() => undefined);
    onClose();
    showInfo(
      "Report received",
      "Thanks for letting us know. We'll review this post within a day."
    );
  }, [onClose, showInfo]);

  const onDeleteOwn = useCallback(() => {
    if (!post || !onDelete) return;
    Haptics.selectionAsync().catch(() => undefined);
    showDeleteConfirmation(
      "Delete this post?",
      "It'll be gone from your feed and from anyone who's already seen it.",
      () => {
        onDelete(post._id);
        onClose();
      }
    );
  }, [onClose, onDelete, post, showDeleteConfirmation]);

  if (!post) return null;

  // Author-only set on your own posts (delete makes sense; muting yourself
  // and reporting yourself don't). Moderation set otherwise.
  const options: MenuOption[] = isOwn
    ? [
        {
          icon: "trash-2",
          label: "Delete post",
          description: "Removes it from the feed and any thread it's in.",
          destructive: true,
          onPress: onDeleteOwn,
        },
      ]
    : [
        {
          icon: "eye-off",
          label: "Not interested",
          description: "We'll show fewer posts like this one.",
          onPress: onNotInterested,
        },
        {
          icon: "user-x",
          label: `Mute @${post.user.username}`,
          description: "Their posts will stop appearing here. They won't be told.",
          onPress: onMute,
        },
        {
          icon: "flag",
          label: "Report post",
          description: "Send this to our review queue.",
          destructive: true,
          onPress: onReport,
        },
      ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: colors.overlay.scrim }}>
        {/* Scrim — separate Pressable so the sheet itself doesn't have to
            wrap children in a Pressable that swallows scroll gestures. */}
        <Pressable
          accessibilityLabel="Dismiss menu"
          onPress={onClose}
          style={{ flex: 1 }}
        />

        <Animated.View style={sheetStyle}>
          <SafeAreaView edges={["bottom"]} style={{ backgroundColor: "transparent" }}>
            <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.sm }}>
              <Surface
                variant="solid"
                radius={radii.xxl}
                style={{
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: colors.border.subtle,
                }}
              >
                {/* IG-style handle bar — telegraphs "this is a sheet". */}
                <View
                  style={{
                    alignItems: "center",
                    paddingTop: spacing.sm,
                    paddingBottom: spacing.xs,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: colors.border.strong,
                    }}
                  />
                </View>

                {/* Post preview header */}
                <View
                  style={{
                    paddingHorizontal: spacing.lg,
                    paddingTop: spacing.sm,
                    paddingBottom: spacing.md,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.md,
                    borderBottomWidth: 0.5,
                    borderBottomColor: colors.border.subtle,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" tone="tertiary" weight="700">
                      POST BY @{post.user.username.toUpperCase()}
                    </Text>
                    <Text
                      variant="bodySm"
                      tone="secondary"
                      numberOfLines={2}
                      style={{ marginTop: 4 }}
                    >
                      {post.content || "Image post"}
                    </Text>
                  </View>
                </View>

                {options.map((opt, i) => (
                  <Pressable
                    key={opt.label}
                    onPress={opt.onPress}
                    android_ripple={{ color: colors.overlay.press }}
                    accessibilityRole="button"
                    accessibilityLabel={opt.label}
                    style={({ pressed }) => ({
                      paddingHorizontal: spacing.lg,
                      paddingVertical: spacing.base,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: spacing.md,
                      opacity: pressed ? 0.85 : 1,
                      borderTopWidth: i === 0 ? 0 : 0.5,
                      borderTopColor: colors.border.subtle,
                    })}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: opt.destructive
                          ? colors.tint.danger + "1A"
                          : colors.surface.secondary,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Feather
                        name={opt.icon}
                        size={20}
                        color={
                          opt.destructive
                            ? colors.tint.danger
                            : colors.text.primary
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        variant="subtitle"
                        tone={opt.destructive ? "danger" : "primary"}
                        numberOfLines={1}
                        weight="700"
                      >
                        {opt.label}
                      </Text>
                      <Text variant="caption" tone="tertiary" numberOfLines={2}>
                        {opt.description}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </Surface>

              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                android_ripple={{ color: colors.overlay.press }}
                style={{ marginTop: spacing.sm }}
              >
                <Surface
                  variant="solid"
                  radius={radii.xxl}
                  style={{
                    paddingVertical: spacing.base,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: colors.border.subtle,
                  }}
                >
                  <Text variant="subtitle" tone="primary" weight="800">
                    Cancel
                  </Text>
                </Surface>
              </Pressable>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

export const PostMenu = memo(PostMenuImpl);
PostMenu.displayName = "PostMenu";

export default PostMenu;
