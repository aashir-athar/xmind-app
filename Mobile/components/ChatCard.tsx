import React, { memo } from "react";
import { Pressable, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { Text } from "@/components/ui/Text";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { useTheme } from "@/hooks/useTheme";
import type { ConversationType } from "@/data/conversations";

export interface ChatCardProps {
  conversation: ConversationType;
  index: number;
  onPress: () => void;
  onLongPress: () => void;
}

// V1 mock — every conversation is treated as having one unread until
// the user opens it. We don't have a real read-state on the mock data,
// so we infer "unread" as "the last message wasn't sent by the viewer".
function inferUnread(conversation: ConversationType): boolean {
  const last = conversation.messages[conversation.messages.length - 1];
  if (!last) return false;
  return !last.fromUser;
}

/**
 * Conversation row.
 *
 * Removed the previous infinite `withRepeat` pulse on the online dot —
 * a constant micro-animation across every list row produces ambient
 * motion fatigue and keeps the GPU warm for no information gain. A
 * static green dot communicates the same fact at zero cost.
 *
 * Added a discrete unread dot + bolder name when there's an unread
 * message — the cue the user expects from every messaging app, sized
 * down to a single 8px disc so it never dominates the row.
 */
function ChatCardImpl({ conversation, onPress, onLongPress }: ChatCardProps) {
  const { colors } = useTheme();

  if (!conversation || !conversation.user) return null;

  const unread = inferUnread(conversation);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      android_ripple={{ color: colors.overlay.press }}
      className="flex-row items-center gap-md p-base my-xs rounded-lg bg-surface border border-subtle"
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
    >
      <View>
        <Avatar
          source={conversation.user.avatar}
          name={conversation.user.name}
          size={48}
        />
        <View
          className="absolute bottom-0 right-0 w-[12px] h-[12px] rounded-full"
          style={{
            backgroundColor: colors.tint.success,
            borderWidth: 2,
            borderColor: colors.surface.primary,
          }}
        />
      </View>

      <View className="flex-1 min-w-0">
        <View className="flex-row items-center gap-xs">
          <Text
            variant="subtitle"
            tone="primary"
            weight={unread ? "700" : "600"}
            numberOfLines={1}
            className="flex-1"
          >
            {conversation.user.name || "Unknown"}
          </Text>
          {conversation.user.verified ? <VerifiedBadge size={14} /> : null}
          <Text
            variant="caption"
            tone={unread ? "tint" : "tertiary"}
            weight={unread ? "700" : "500"}
          >
            {conversation.time || "now"}
          </Text>
        </View>

        <View className="flex-row items-center gap-xs mt-[2px]">
          <Text
            variant="bodySm"
            tone={unread ? "primary" : "secondary"}
            weight={unread ? "600" : "400"}
            numberOfLines={2}
            className="flex-1"
          >
            {conversation.lastMessage || "No messages yet"}
          </Text>
          {unread ? (
            <View
              className="w-[8px] h-[8px] rounded-full"
              style={{ backgroundColor: colors.tint.primary }}
            />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export const ChatCard = memo(ChatCardImpl, (prev, next) =>
  prev.conversation.id === next.conversation.id &&
  prev.conversation.lastMessage === next.conversation.lastMessage &&
  prev.conversation.time === next.conversation.time
);
ChatCard.displayName = "ChatCard";

export default ChatCard;
