/**
 * ChatCard — single inbox row.
 *
 * v2: backed by real Conversation data (was: mock).
 *  - Shows the OTHER participant's avatar + name.
 *  - Bolds the last-message line + name when there's an unread count.
 *  - Renders a coral pill with the unread number when applicable.
 *  - Tap → opens the thread; long-press → trigger a delete-conversation
 *    confirmation handled by the parent.
 */
import React, { memo, useCallback } from "react";
import { Pressable, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { Text } from "@/components/ui/Text";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { useTheme } from "@/hooks/useTheme";
import { formatDate } from "@/utils/formatter";
import type { ChatUser, Conversation } from "@/types";

export interface ChatCardProps {
  conversation: Conversation;
  /** The current user's id — used to pick the *other* participant. */
  currentUserId: string | null | undefined;
  onPress: (conversation: Conversation) => void;
  onLongPress?: (conversation: Conversation) => void;
}

function pickOther(conversation: Conversation, currentUserId: string | null | undefined): ChatUser | null {
  if (!conversation.participants) return null;
  return (
    conversation.participants.find((p) => p._id !== currentUserId) ??
    conversation.participants[0] ??
    null
  );
}

function ChatCardImpl({ conversation, currentUserId, onPress, onLongPress }: ChatCardProps) {
  const { colors, spacing } = useTheme();
  const other = pickOther(conversation, currentUserId);
  const last = conversation.lastMessage;
  const unread = conversation.unreadCount ?? 0;

  const handlePress = useCallback(() => onPress(conversation), [conversation, onPress]);
  const handleLongPress = useCallback(
    () => onLongPress?.(conversation),
    [conversation, onLongPress]
  );

  if (!other) return null;

  const lastBody = last?.body ?? "Tap to say hi";
  const isMine = last?.sender === currentUserId;

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={400}
      android_ripple={{ color: colors.overlay.press }}
      accessibilityRole="button"
      accessibilityLabel={`Open conversation with ${other.firstName} ${other.lastName}`}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Avatar
        source={other.profilePicture}
        name={`${other.firstName} ${other.lastName}`}
        size={56}
      />

      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text
            variant="subtitle"
            tone="primary"
            weight={unread > 0 ? "800" : "700"}
            numberOfLines={1}
            style={{ flex: 1 }}
          >
            {other.firstName} {other.lastName}
          </Text>
          {other.verified ? <VerifiedBadge size={13} /> : null}
          {last?.createdAt ? (
            <Text variant="caption" tone="tertiary">
              · {formatDate(last.createdAt)}
            </Text>
          ) : null}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: 2 }}>
          <Text
            variant="bodySm"
            tone={unread > 0 ? "primary" : "secondary"}
            weight={unread > 0 ? "600" : "400"}
            numberOfLines={1}
            style={{ flex: 1 }}
          >
            {isMine ? "You: " : ""}
            {lastBody}
          </Text>
          {unread > 0 ? (
            <View
              style={{
                minWidth: 20,
                height: 20,
                paddingHorizontal: 6,
                borderRadius: 10,
                backgroundColor: colors.tint.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="caption" tone="inverse" weight="800">
                {unread > 99 ? "99+" : unread}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export const ChatCard = memo(
  ChatCardImpl,
  (prev, next) =>
    prev.conversation._id === next.conversation._id &&
    prev.conversation.lastActivityAt === next.conversation.lastActivityAt &&
    prev.conversation.unreadCount === next.conversation.unreadCount &&
    prev.currentUserId === next.currentUserId
);
ChatCard.displayName = "ChatCard";

export default ChatCard;
