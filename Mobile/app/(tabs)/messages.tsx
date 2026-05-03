import React, { useCallback, useDeferredValue, useMemo, useState } from "react";
import { Pressable, RefreshControl, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import { Feather } from "@expo/vector-icons";

import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { Text } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import ChatCard from "@/components/ChatCard";
import ChatModal from "@/components/ChatModal";
import CustomAlert from "@/components/CustomAlert";
import { useTheme } from "@/hooks/useTheme";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { CONVERSATIONS, type ConversationType } from "@/data/conversations";

/**
 * Messages list.
 *
 * Search uses `useDeferredValue` so each keystroke updates the input
 * immediately while the heavier filter pass runs at lower priority.
 * On low-end Android this is the difference between fluid typing
 * and a 60–120ms keystroke lag.
 *
 * The delete-conversation alert is the in-app `<CustomAlert>`. ChatModal
 * is full-screen, so the alert only fires when the modal is closed —
 * no stacked-Modal conflict.
 */
export default function MessagesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showDeleteConfirmation, alertConfig, isVisible, hideAlert } = useCustomAlert();

  const [conversations, setConversations] = useState<ConversationType[]>(CONVERSATIONS);
  const [selected, setSelected] = useState<ConversationType | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.user.name.toLowerCase().includes(q) ||
        c.user.username.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [deferredQuery, conversations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    setRefreshing(false);
  }, []);

  const onConversationPress = useCallback((c: ConversationType) => {
    setSelected(c);
    setOpen(true);
  }, []);

  const onConversationLongPress = useCallback(
    (c: ConversationType) => {
      showDeleteConfirmation(
        "Delete this conversation?",
        "It'll disappear from your inbox. The other person still has it.",
        () => {
          setConversations((prev) => prev.filter((x) => x.id !== c.id));
          if (selected?.id === c.id) {
            setOpen(false);
            setSelected(null);
          }
        }
      );
    },
    [selected?.id, showDeleteConfirmation]
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<ConversationType>) => (
      <ChatCard
        conversation={item}
        index={index}
        onPress={() => onConversationPress(item)}
        onLongPress={() => onConversationLongPress(item)}
      />
    ),
    [onConversationPress, onConversationLongPress]
  );

  const keyExtractor = useCallback(
    (item: ConversationType) => String(item.id),
    []
  );

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView edges={["top"]}>
        <View className="flex-row items-center gap-md px-lg py-md">
          <View className="flex-1">
            <Text variant="headline" tone="primary">
              Messages
            </Text>
            <Text variant="bodySm" tone="secondary">
              {filtered.length} {filtered.length === 1 ? "conversation" : "conversations"}
            </Text>
          </View>
          <IconButton accessibilityLabel="New message" variant="filled">
            <Feather name="edit-3" size={18} color={colors.text.primary} />
          </IconButton>
        </View>

        <View className="px-lg pb-md">
          <TextField
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or message"
            leading={<Feather name="search" size={18} color={colors.text.tertiary} />}
            trailing={
              query.length > 0 ? (
                <Pressable
                  onPress={() => setQuery("")}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Clear"
                >
                  <Feather name="x" size={16} color={colors.text.secondary} />
                </Pressable>
              ) : null
            }
          />
        </View>
      </SafeAreaView>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Feather name="message-circle" size={28} color={colors.tint.primary} />}
          title={query ? "No conversations match" : "Inbox zero"}
          description={
            query
              ? "Try a shorter name or a different keyword."
              : "Open someone's profile and tap message — your first thread will live here."
          }
        />
      ) : (
        <FlashList<ConversationType>
          data={filtered}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 140 + insets.bottom,
          }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.tint.primary}
              colors={[colors.tint.primary]}
            />
          }
        />
      )}

      <ChatModal
        isChatOpen={open}
        selectedConversation={selected}
        setIsChatOpen={setOpen}
        setSelectedConversation={setSelected}
        setConversationsList={setConversations}
      />

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
    </View>
  );
}
