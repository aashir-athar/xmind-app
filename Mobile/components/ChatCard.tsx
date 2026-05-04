/**
 * ChatCard — single inbox row.
 *
 * Layout (WhatsApp / iMessage / Messenger pattern):
 *   ┌─────────┬──────────────────────────────────────┬──────────┐
 *   │ avatar  │ name [verified]                       │ time     │
 *   │ + dot   │ (last message)                        │ unread # │
 *   └─────────┴──────────────────────────────────────┴──────────┘
 *
 * Three columns: a fixed-width avatar block, a flex-1 middle column
 * for name + message preview, and a fixed-width right column for the
 * timestamp + unread badge. Each column's content is internally
 * justified vertically, so the row reads cleanly even when the name
 * truncates or the preview wraps.
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

function pickOther(
  conversation: Conversation,
  currentUserId: string | null | undefined
): ChatUser | null {
  if (!conversation.participants) return null;
  return (
    conversation.participants.find((p) => p._id !== currentUserId) ??
    conversation.participants[0] ??
    null
  );
}

function ChatCardImpl({
  conversation,
  currentUserId,
  onPress,
  onLongPress,
}: ChatCardProps) {
  const { colors, spacing } = useTheme();
  const other = pickOther(conversation, currentUserId);
  const last = conversation.lastMessage;
  const unread = conversation.unreadCount ?? 0;

  const handlePress = useCallback(
    () => onPress(conversation),
    [conversation, onPress]
  );
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
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md + 2,
        backgroundColor: pressed ? colors.surface.secondary : "transparent",
      })}
    >
      {/* Left column: avatar with optional unread dot. Fixed width. */}
      <View style={{ width: 56, height: 56, position: "relative" }}>
        <Avatar
          source={other.profilePicture}
          name={`${other.firstName} ${other.lastName}`}
          size={56}
        />
        {unread > 0 ? (
          <View
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: colors.tint.primary,
              borderWidth: 2,
              borderColor: colors.bg.canvas,
            }}
          />
        ) : null}
      </View>

      {/* Middle column: name + preview, stacked. Takes the remaining
          width. minWidth: 0 lets the inner Texts truncate. */}
      <View
        style={{
          flex: 1,
          minWidth: 0,
          marginLeft: spacing.base,
          marginRight: spacing.sm,
          justifyContent: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Text
            variant="subtitle"
            tone="primary"
            weight={unread > 0 ? "800" : "700"}
            numberOfLines={1}
            style={{ flexShrink: 1 }}
          >
            {other.firstName} {other.lastName}
          </Text>
          {other.verified ? <VerifiedBadge size={14} /> : null}
        </View>

        <Text
          variant="bodySm"
          tone={unread > 0 ? "primary" : "secondary"}
          weight={unread > 0 ? "700" : "400"}
          numberOfLines={1}
          style={{ marginTop: 2 }}
        >
          {isMine ? "You: " : ""}
          {lastBody}
        </Text>
      </View>

      {/* Right column: timestamp on top, unread badge below. Fixed
          alignment so multiple rows visually line up regardless of
          name length. */}
      <View
        style={{
          alignItems: "flex-end",
          justifyContent: "center",
          minWidth: 56,
          gap: 6,
        }}
      >
        {last?.createdAt ? (
          <Text
            variant="caption"
            tone={unread > 0 ? "tint" : "tertiary"}
            weight={unread > 0 ? "700" : "500"}
          >
            {formatDate(last.createdAt)}
          </Text>
        ) : null}
        {unread > 0 ? (
          <View
            style={{
              minWidth: 22,
              height: 22,
              paddingHorizontal: 7,
              borderRadius: 11,
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
