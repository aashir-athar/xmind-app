import React, { useCallback } from "react";
import { RefreshControl, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import { Feather } from "@expo/vector-icons";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import NotificationCard from "@/components/NotificationCard";
import { useTheme } from "@/hooks/useTheme";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification } from "@/types";

/**
 * Notifications.
 *
 * Psychology:
 *  - Empty state names what the user can do next ("post something to get
 *    your first reaction") rather than the absence ("no notifications").
 *    Naming the next action lifts D1 retention measurably.
 *  - Skeleton states reserve real estate so the layout never reflows
 *    when data arrives — visual stability builds perceived speed.
 */
export default function NotificationsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    notifications,
    isLoading,
    error,
    refetch,
    isRefetching,
    deleteNotification,
  } = useNotifications();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Notification>) => (
      <NotificationCard notification={item} onDelete={deleteNotification} />
    ),
    [deleteNotification]
  );

  const keyExtractor = useCallback((item: Notification) => item._id, []);

  if (error) {
    return (
      <View className="flex-1 bg-canvas">
        <Header />
        <EmptyState
          icon={<Feather name="alert-triangle" size={28} color={colors.tint.danger} />}
          title="Couldn't load your inbox"
          description="Probably the network. Try again in a moment."
          action={<Button label="Try again" onPress={() => refetch()} />}
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-canvas">
        <Header />
        <View className="px-base gap-md mt-md">
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              className="flex-row gap-md p-base rounded-lg bg-surface border border-subtle"
            >
              <Skeleton width={40} height={40} radius={20} />
              <View className="flex-1 gap-sm">
                <Skeleton width="70%" height={12} />
                <Skeleton width="40%" height={10} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View className="flex-1 bg-canvas">
        <Header />
        <EmptyState
          icon={<Feather name="bell" size={28} color={colors.tint.primary} />}
          title="It's quiet in here"
          description="Reactions, replies, and follows land here. Posting is the fastest way to start one."
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <Header />
      <FlashList<Notification>
        data={notifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: 140 + insets.bottom,
        }}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.tint.primary}
            colors={[colors.tint.primary]}
          />
        }
      />
    </View>
  );
}

function Header() {
  return (
    <SafeAreaView edges={["top"]} className="bg-canvas">
      <View className="px-lg py-md border-b border-subtle">
        <Text variant="headline" tone="primary">
          Inbox
        </Text>
        <Text variant="bodySm" tone="secondary">
          Replies and follows, all in one place.
        </Text>
      </View>
    </SafeAreaView>
  );
}
