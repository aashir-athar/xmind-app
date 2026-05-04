/**
 * Messages — inbox.
 *
 * Lever: progress signal.
 *  Unread badges per row + a compact title that names the queue size
 *  give the user a clean signal of "what's waiting" without requiring
 *  them to open every conversation.
 *
 * Polling lives in `useConversations`; no extra wiring here.
 */
import React, { useCallback, useDeferredValue, useMemo, useState } from "react";
import { Pressable, RefreshControl, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import { Feather } from "@expo/vector-icons";

import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import ChatCard from "@/components/ChatCard";
import { useTheme } from "@/hooks/useTheme";
import { useConversations } from "@/hooks/useConversations";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { Conversation } from "@/types";

export default function MessagesScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { conversations, isLoading, refetch, isRefetching } = useConversations();
  const { currentUser } = useCurrentUser();

  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const other = c.participants?.find((p) => p._id !== currentUser?._id);
      if (!other) return false;
      const inName =
        `${other.firstName} ${other.lastName}`.toLowerCase().includes(q) ||
        other.username.toLowerCase().includes(q);
      const inMessage = c.lastMessage?.body?.toLowerCase().includes(q) ?? false;
      return inName || inMessage;
    });
  }, [conversations, currentUser?._id, deferredQuery]);

  const onPressConversation = useCallback(
    (c: Conversation) => {
      router.push({
        pathname: "/messages/[conversationId]",
        params: { conversationId: c._id },
      });
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Conversation>) => (
      <ChatCard
        conversation={item}
        currentUserId={currentUser?._id ?? null}
        onPress={onPressConversation}
      />
    ),
    [currentUser?._id, onPressConversation]
  );

  const keyExtractor = useCallback((c: Conversation) => c._id, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.canvas }}>
      <SafeAreaView edges={["top"]}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            gap: spacing.md,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.border.subtle,
          }}
        >
          <IconButton
            accessibilityLabel="Back"
            onPress={() => router.back()}
            variant="filled"
          >
            <Feather name="arrow-left" size={18} color={colors.text.primary} />
          </IconButton>
          <View style={{ flex: 1 }}>
            <Text variant="title" tone="primary">
              Messages
            </Text>
            <Text variant="bodySm" tone="secondary">
              {filtered.length}{" "}
              {filtered.length === 1 ? "conversation" : "conversations"}
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }}>
          <TextField
            shape="pill"
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, handle, or message"
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

      {isLoading ? (
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            gap: spacing.md,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={{ flexDirection: "row", gap: spacing.md, alignItems: "center" }}
            >
              <Skeleton width={56} height={56} radius={28} />
              <View style={{ flex: 1, gap: spacing.sm }}>
                <Skeleton width="40%" height={14} />
                <Skeleton width="80%" height={12} />
              </View>
            </View>
          ))}
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Feather name="send" size={28} color={colors.tint.primary} />}
          title={query ? "No conversations match" : "Inbox zero"}
          description={
            query
              ? "Try a shorter name or a different keyword."
              : "Open someone's profile and tap message — your first thread will live here."
          }
        />
      ) : (
        <FlashList<Conversation>
          data={filtered}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.tint.primary}
              colors={[colors.tint.primary]}
            />
          }
        />
      )}
    </View>
  );
}
