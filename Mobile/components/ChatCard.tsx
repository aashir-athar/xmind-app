import React, { memo } from "react";
import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Avatar } from "@/components/ui/Avatar";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/hooks/useTheme";
import type { ConversationType } from "@/data/conversations";

export interface ChatCardProps {
  conversation: ConversationType;
  index: number;
  onPress: () => void;
  onLongPress: () => void;
}

/**
 * Conversation row.
 *
 * Removed the previous infinite `withRepeat` pulse on the online dot —
 * a constant micro-animation across every list row produces ambient
 * motion fatigue and keeps the GPU warm for no information gain. A
 * static green dot communicates the same fact at zero cost.
 */
function ChatCardImpl({ conversation, onPress, onLongPress }: ChatCardProps) {
  const { colors } = useTheme();

  if (!conversation || !conversation.user) return null;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      android_ripple={{ color: colors.overlay.press }}
      // The pressed-opacity needs the runtime pressable state, so the
      // outer flex/spacing/border is className while opacity stays inline.
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
          <Text variant="subtitle" tone="primary" numberOfLines={1} className="flex-1">
            {conversation.user.name || "Unknown"}
          </Text>
          {conversation.user.verified ? (
            <View
              className="w-[16px] h-[16px] rounded-full items-center justify-center"
              style={{ backgroundColor: colors.tint.primary }}
            >
              <MaterialCommunityIcons name="check" size={10} color={colors.text.onTint} />
            </View>
          ) : null}
          <Text variant="caption" tone="tertiary">
            {conversation.time || "now"}
          </Text>
        </View>

        <Text
          variant="bodySm"
          tone="secondary"
          numberOfLines={2}
          className="mt-[2px]"
        >
          {conversation.lastMessage || "No messages yet"}
        </Text>
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
