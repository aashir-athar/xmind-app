import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList, type FlashListRef, type ListRenderItemInfo } from "@shopify/flash-list";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/IconButton";
import { Surface } from "@/components/ui/Surface";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/hooks/useTheme";
import type { ConversationType, MessageType } from "@/data/conversations";

export interface ChatModalProps {
  isChatOpen: boolean;
  selectedConversation: ConversationType | null;
  setIsChatOpen: (isOpen: boolean) => void;
  setSelectedConversation: (conversation: ConversationType | null) => void;
  setConversationsList: (
    cb: (prev: ConversationType[]) => ConversationType[]
  ) => void;
}

/**
 * Threaded chat sheet.
 *
 * Replaced the previous nested ScrollView with a FlashList for the
 * message list — the original would throttle once a thread crossed
 * ~80 messages. Surface handles the modal scrim per platform: glass
 * on iOS 26+, blur on iOS<26, themed flat surface on Android.
 *
 * KeyboardAvoidingView is wired with `padding` on iOS and `height`
 * on Android — the only combination that keeps the input docked
 * above the keyboard on every device we tested.
 */
function ChatModalImpl({
  isChatOpen,
  selectedConversation,
  setIsChatOpen,
  setSelectedConversation,
  setConversationsList,
}: ChatModalProps) {
  const { colors, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlashListRef<MessageType>>(null);

  const [draft, setDraft] = useState("");

  const open = useSharedValue(0);

  useEffect(() => {
    open.value = withTiming(isChatOpen ? 1 : 0, { duration: 220 });
  }, [isChatOpen, open]);

  // Auto-scroll to the latest message when one is added or when the modal opens.
  useEffect(() => {
    if (!selectedConversation) return;
    const id = setTimeout(() => {
      const last = (selectedConversation.messages?.length ?? 1) - 1;
      if (last >= 0) listRef.current?.scrollToIndex({ index: last, animated: true });
    }, 80);
    return () => clearTimeout(id);
  }, [selectedConversation, isChatOpen]);

  const close = useCallback(() => {
    setIsChatOpen(false);
    setSelectedConversation(null);
    setDraft("");
  }, [setIsChatOpen, setSelectedConversation]);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || !selectedConversation) return;

    const now = new Date();
    const lastId =
      selectedConversation.messages[selectedConversation.messages.length - 1]?.id ?? 0;
    const outgoing: MessageType = {
      id: lastId + 1,
      text,
      fromUser: true,
      timestamp: now,
      time: "now",
    };

    setConversationsList((prev) => {
      const updated = prev.map((conv) =>
        conv.id === selectedConversation.id
          ? {
              ...conv,
              lastMessage: text,
              time: "now",
              timestamp: now,
              messages: [...conv.messages, outgoing],
            }
          : conv
      );
      return updated.sort(
        (a, b) =>
          (b.timestamp?.getTime?.() ?? 0) - (a.timestamp?.getTime?.() ?? 0)
      );
    });

    setSelectedConversation({
      ...selectedConversation,
      lastMessage: text,
      time: "now",
      timestamp: now,
      messages: [...selectedConversation.messages, outgoing],
    });
    setDraft("");
  }, [draft, selectedConversation, setConversationsList, setSelectedConversation]);

  const containerAnimated = useAnimatedStyle(() => ({
    opacity: open.value,
    transform: [{ scale: 0.96 + open.value * 0.04 }],
  }));

  const renderMessage = useCallback(
    ({ item }: ListRenderItemInfo<MessageType>) => (
      <MessageBubble message={item} avatar={selectedConversation?.user.avatar} name={selectedConversation?.user.name} />
    ),
    [selectedConversation?.user.avatar, selectedConversation?.user.name]
  );

  const keyExtractor = useCallback((m: MessageType) => String(m.id), []);

  const messages = useMemo(
    () => selectedConversation?.messages ?? [],
    [selectedConversation?.messages]
  );

  if (!selectedConversation) return null;

  return (
    <Modal
      visible={isChatOpen}
      transparent
      animationType="fade"
      onRequestClose={close}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: colors.overlay.scrim }}>
        <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
          <Animated.View style={[{ flex: 1, padding: spacing.base }, containerAnimated]}>
            <Surface
              variant="solid"
              radius={radii.xl}
              style={{
                flex: 1,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: colors.border.subtle,
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border.subtle,
                  gap: spacing.md,
                }}
              >
                <IconButton accessibilityLabel="Close" onPress={close}>
                  <Feather name="x" size={20} color={colors.text.primary} />
                </IconButton>
                <Avatar source={selectedConversation.user.avatar} name={selectedConversation.user.name} size={36} />
                <View style={{ flex: 1 }}>
                  <Text variant="subtitle" tone="primary" numberOfLines={1}>
                    {selectedConversation.user.name}
                  </Text>
                  <Text variant="caption" tone="tertiary">
                    @{selectedConversation.user.username}
                  </Text>
                </View>
              </View>

              {/* Messages */}
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={insets.top + 24}
                style={{ flex: 1 }}
              >
                <FlashList<MessageType>
                  ref={listRef}
                  data={messages}
                  renderItem={renderMessage}
                  keyExtractor={keyExtractor}
                  contentContainerStyle={{
                    paddingHorizontal: spacing.base,
                    paddingTop: spacing.md,
                    paddingBottom: spacing.md,
                  }}
                  showsVerticalScrollIndicator={false}
                />

                {/* Composer */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-end",
                    gap: spacing.sm,
                    paddingHorizontal: spacing.base,
                    paddingTop: spacing.sm,
                    paddingBottom: spacing.md,
                    borderTopWidth: 1,
                    borderTopColor: colors.border.subtle,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      borderRadius: radii.lg,
                      backgroundColor: colors.surface.secondary,
                      paddingHorizontal: spacing.md,
                      paddingVertical: 8,
                      minHeight: 44,
                      maxHeight: 120,
                      justifyContent: "center",
                    }}
                  >
                    <TextInput
                      style={{
                        fontSize: 15,
                        lineHeight: 20,
                        color: colors.text.primary,
                        textAlignVertical: "center",
                      }}
                      placeholder="Type a message"
                      placeholderTextColor={colors.text.tertiary}
                      value={draft}
                      onChangeText={setDraft}
                      multiline
                    />
                  </View>
                  <Pressable
                    onPress={send}
                    disabled={!draft.trim()}
                    accessibilityRole="button"
                    accessibilityLabel="Send message"
                    accessibilityState={{ disabled: !draft.trim() }}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: radii.pill,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: draft.trim()
                        ? colors.tint.primary
                        : colors.surface.sunken,
                    }}
                  >
                    <Feather
                      name="send"
                      size={18}
                      color={draft.trim() ? colors.text.onTint : colors.text.tertiary}
                    />
                  </Pressable>
                </View>
              </KeyboardAvoidingView>
            </Surface>
          </Animated.View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

interface MessageBubbleProps {
  message: MessageType;
  avatar?: string;
  name?: string;
}

function MessageBubbleImpl({ message, avatar, name }: MessageBubbleProps) {
  const { colors, spacing, radii } = useTheme();
  const fromUser = !!message.fromUser;
  return (
    <View
      style={{
        flexDirection: "row",
        marginBottom: spacing.sm,
        justifyContent: fromUser ? "flex-end" : "flex-start",
        gap: spacing.sm,
      }}
    >
      {!fromUser ? <Avatar source={avatar} name={name} size={28} /> : null}
      <View style={{ maxWidth: "76%" }}>
        <View
          style={{
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: radii.lg,
            backgroundColor: fromUser ? colors.tint.primary : colors.surface.secondary,
          }}
        >
          <Text variant="body" style={{ color: fromUser ? colors.text.onTint : colors.text.primary }}>
            {message.text}
          </Text>
        </View>
        <Text variant="caption" tone="tertiary" style={{ marginTop: 2, marginHorizontal: 4 }}>
          {message.time}
        </Text>
      </View>
    </View>
  );
}

const MessageBubble = memo(MessageBubbleImpl, (prev, next) =>
  prev.message.id === next.message.id && prev.message.text === next.message.text
);
MessageBubble.displayName = "MessageBubble";

export const ChatModal = memo(ChatModalImpl);
ChatModal.displayName = "ChatModal";

export default ChatModal;
