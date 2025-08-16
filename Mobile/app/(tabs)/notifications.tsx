import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNotifications } from "@/hooks/useNotifications";
import { Feather } from "@expo/vector-icons";
import NoNotificationsFound from "@/components/NoNotificationsFound";
import NotificationCard from "@/components/NotificationCard";
import { Notification } from "@/types";
import { FlashList } from "@shopify/flash-list";

const NotificationsScreen = () => {
  const {
    notifications,
    isLoading,
    error,
    refetch,
    isRefetching,
    deleteNotification,
  } = useNotifications();
  const insets = useSafeAreaInsets();

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-textSecondary mb-4">
          Failed to load notifications
        </Text>
        <TouchableOpacity
          className="bg-primary px-4 py-2 rounded-lg"
          onPress={() => refetch()}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-borderLight">
        <Text className="text-xl font-bold text-textPrimary">
          Notifications
        </Text>
        <TouchableOpacity>
          <Feather name="settings" size={24} color="#4527A0" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={"#7E57C2"}
            title="Getting latest notifications..."
            titleColor={"#B0BEC5"}
          />
        }
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center p-8">
            <ActivityIndicator size="large" color="#4527A0" />
            <Text className="text-textSecondary mt-4">
              Loading notifications...
            </Text>
          </View>
        ) : notifications.length === 0 ? (
          <NoNotificationsFound />
        ) : (
          <FlashList
            data={notifications}
            renderItem={({ item }: { item: Notification }) => (
              <NotificationCard
                notification={item}
                onDelete={deleteNotification}
              />
            )}
            keyExtractor={(item: Notification) => item._id}
            // Optional: Add props for performance or UX
            showsVerticalScrollIndicator={false}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsScreen;
