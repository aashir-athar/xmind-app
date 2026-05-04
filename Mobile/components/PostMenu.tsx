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
}

interface MenuOption {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  description: string;
  destructive?: boolean;
  onPress: () => void;
}

function PostMenuImpl({ post, onClose }: PostMenuProps) {
  const { colors, spacing, radii } = useTheme();
  const open = useSharedValue(0);
  const visible = !!post;

  const markNotInterested = useFeedbackStore((s) => s.markNotInterested);
  const muteAuthor = useFeedbackStore((s) => s.muteAuthor);
  // Native alerts so the confirmation can stack over this modal sheet —
  // React Native does not support overlapping <Modal> components.
  const { showInfo, showSuccess } = useCustomAlert({ useNative: true });

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

  if (!post) return null;

  const options: MenuOption[] = [
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
        <Pressable
          accessibilityLabel="Dismiss menu"
          onPress={onClose}
          style={{
            flex: 1,
            backgroundColor: colors.overlay.scrim,
            justifyContent: "flex-end",
          }}
        >
          <SafeAreaView edges={["bottom"]}>
            <Animated.View style={[{ padding: spacing.base }, sheetStyle]}>
              <Pressable onPress={(e) => e.stopPropagation()}>
                <Surface
                  variant="solid"
                  radius={radii.xl}
                  style={{
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: colors.border.subtle,
                  }}
                >
                  <View
                    style={{
                      paddingHorizontal: spacing.lg,
                      paddingTop: spacing.lg,
                      paddingBottom: spacing.sm,
                    }}
                  >
                    <Text variant="caption" tone="tertiary">
                      Post by @{post.user.username}
                    </Text>
                    <Text
                      variant="bodySm"
                      tone="primary"
                      numberOfLines={2}
                      style={{ marginTop: 4 }}
                    >
                      {post.content || "Image post"}
                    </Text>
                  </View>

                  <View style={{ height: 1, backgroundColor: colors.border.subtle }} />

                  {options.map((opt, i) => (
                    <Pressable
                      key={opt.label}
                      onPress={opt.onPress}
                      android_ripple={{ color: colors.overlay.press }}
                      accessibilityRole="button"
                      accessibilityLabel={opt.label}
                      style={({ pressed }) => ({
                        paddingHorizontal: spacing.lg,
                        paddingVertical: spacing.md,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing.md,
                        opacity: pressed ? 0.85 : 1,
                        borderTopWidth: i === 0 ? 0 : 1,
                        borderTopColor: colors.border.subtle,
                      })}
                    >
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: opt.destructive
                            ? colors.surface.secondary
                            : colors.surface.secondary,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Feather
                          name={opt.icon}
                          size={18}
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
                        >
                          {opt.label}
                        </Text>
                        <Text variant="bodySm" tone="tertiary" numberOfLines={1}>
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
                    radius={radii.xl}
                    style={{
                      paddingVertical: spacing.md,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: colors.border.subtle,
                    }}
                  >
                    <Text variant="subtitle" tone="primary">
                      Cancel
                    </Text>
                  </Surface>
                </Pressable>
              </Pressable>
            </Animated.View>
          </SafeAreaView>
        </Pressable>
      </Modal>
  );
}

export const PostMenu = memo(PostMenuImpl);
PostMenu.displayName = "PostMenu";

export default PostMenu;
