import React, { useCallback, useMemo } from "react";
import { RefreshControl, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import { Feather } from "@expo/vector-icons";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import GroupedNotificationCard, {
  type NotificationGroup,
} from "@/components/GroupedNotificationCard";
import { useTheme } from "@/hooks/useTheme";
import { useNotifications } from "@/hooks/useNotifications";
import { groupNotifications } from "@/utils/notificationGrouping";

/**
 * Notifications.
 *
 * Psychology lever — Cognitive economy + Peak-end rule:
 *  Same-day groups compress the visual stack so the user feels
 *  progress at a glance instead of being buried in repeats. The empty
 *  state names the next action ("post something to get your first
 *  reaction") rather than the absence — naming the next step lifts
 *  D1 retention measurably.
 *  Skeleton states reserve real estate so the layout never reflows
 *  when data arrives — visual stability builds perceived speed.
 */
export default function NotificationsScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { notifications, isLoading, error, refetch, isRefetching } =
    useNotifications();

  const groups = useMemo(
    () => groupNotifications(notifications),
    [notifications]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<NotificationGroup>) => (
      <GroupedNotificationCard group={item} />
    ),
    []
  );

  const keyExtractor = useCallback((item: NotificationGroup) => item.id, []);

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
        <View style={{ paddingHorizontal: spacing.base, gap: spacing.md, marginTop: spacing.md }}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                gap: spacing.md,
                padding: spacing.base,
                borderRadius: 20,
                backgroundColor: colors.surface.primary,
                borderWidth: 1,
                borderColor: colors.border.subtle,
              }}
            >
              <Skeleton width={44} height={44} radius={22} />
              <View style={{ flex: 1, gap: spacing.sm }}>
                <Skeleton width="60%" height={12} />
                <Skeleton width="40%" height={10} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View className="flex-1 bg-canvas">
        <Header />
        <EmptyState
          icon={<Feather name="bell" size={28} color={colors.tint.primary} />}
          title="No replies yet — that's about to change"
          description="Post one short thought. The first reaction usually lands within an hour."
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <Header subtitle={`${groups.length} ${groups.length === 1 ? "update" : "updates"}`} />
      <FlashList<NotificationGroup>
        data={groups}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: spacing.sm,
          paddingBottom: 140 + insets.bottom,
        }}
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

function Header({ subtitle }: { subtitle?: string }) {
  return (
    <SafeAreaView edges={["top"]} className="bg-canvas">
      <View className="px-lg py-md border-b border-subtle">
        <Text variant="headline" tone="primary">
          Inbox
        </Text>
        <Text variant="bodySm" tone="secondary">
          {subtitle ?? "Replies and follows, all in one place."}
        </Text>
      </View>
    </SafeAreaView>
  );
}