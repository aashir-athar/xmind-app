import React, { memo, useCallback } from "react";
import { Image, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import CustomAlert from "@/components/CustomAlert";
import { useTheme } from "@/hooks/useTheme";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { formatDate } from "@/utils/formatter";
import type { Notification } from "@/types";

export interface NotificationCardProps {
  notification: Notification;
  onDelete: (notificationId: string) => void;
}

/**
 * Single notification row.
 * Memoised so FlashList recycles cleanly. Visual hierarchy:
 *   avatar(+ event glyph) → name → action sentence → preview → time.
 * Each line is intentionally short — the inbox is for scanning, not reading.
 */
function NotificationCardImpl({ notification, onDelete }: NotificationCardProps) {
  const { colors } = useTheme();
  const { showDeleteConfirmation, alertConfig, isVisible, hideAlert } =
    useCustomAlert();

  const handleDelete = useCallback(() => {
    showDeleteConfirmation(
      "Dismiss this notification?",
      "Removing it doesn't undo what it's about.",
      () => onDelete(notification._id)
    );
  }, [notification._id, onDelete, showDeleteConfirmation]);

  const sentence = (() => {
    const name = `${notification.from.firstName} ${notification.from.lastName}`;
    switch (notification.type) {
      case "like":
        return `${name} liked your post`;
      case "comment":
        return `${name} commented on your post`;
      case "follow":
        return `${name} started following you`;
      default:
        return `${name} did something`;
    }
  })();

  const glyph = (() => {
    switch (notification.type) {
      case "like":
        return { name: "heart", color: colors.tint.danger } as const;
      case "comment":
        return { name: "message-circle", color: colors.tint.primary } as const;
      case "follow":
        return { name: "user-plus", color: colors.tint.success } as const;
      default:
        return { name: "bell", color: colors.text.tertiary } as const;
    }
  })();

  return (
    <>
      <Card
        variant="solid"
        className="mx-base mb-sm p-base border border-subtle"
      >
        <View className="flex-row gap-md">
          <View>
            <Avatar
              source={notification.from.profilePicture}
              name={`${notification.from.firstName} ${notification.from.lastName}`}
              size={44}
            />
            <View
              className="absolute -right-[4px] -bottom-[4px] w-[22px] h-[22px] rounded-full items-center justify-center bg-surface border border-subtle"
            >
              <Feather name={glyph.name} size={12} color={glyph.color} />
            </View>
          </View>

          <View className="flex-1 min-w-0">
            <View className="flex-row items-start justify-between">
              <Text variant="body" tone="primary" className="flex-1">
                {sentence}
              </Text>
              <Pressable
                onPress={handleDelete}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Dismiss notification"
                className="w-[28px] h-[28px] rounded-pill items-center justify-center"
              >
                <Feather name="x" size={14} color={colors.text.tertiary} />
              </Pressable>
            </View>

            <Text variant="caption" tone="tertiary" className="mt-[2px]">
              @{notification.from.username} · {formatDate(notification.createdAt)}
            </Text>

            {notification.post ? (
              <View
                className="mt-sm p-sm rounded-md bg-surface-secondary gap-xs"
                style={{
                  borderLeftWidth: 3,
                  borderLeftColor: colors.tint.primary,
                }}
              >
                <Text variant="bodySm" tone="secondary" numberOfLines={2}>
                  {notification.post.content}
                </Text>
                {notification.post.image ? (
                  <Image
                    source={{ uri: notification.post.image }}
                    style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: 8 }}
                    resizeMode="cover"
                  />
                ) : null}
              </View>
            ) : null}

            {notification.comment ? (
              <View
                className="mt-sm p-sm rounded-md bg-surface-secondary"
                style={{
                  borderLeftWidth: 3,
                  borderLeftColor: colors.tint.accent,
                }}
              >
                <Text
                  variant="bodySm"
                  tone="secondary"
                  numberOfLines={2}
                  className="italic"
                >
                  "{notification.comment.content}"
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </Card>

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

export const NotificationCard = memo(NotificationCardImpl, (prev, next) =>
  prev.notification._id === next.notification._id &&
  prev.notification.type === next.notification.type
);
NotificationCard.displayName = "NotificationCard";

export default NotificationCard;
