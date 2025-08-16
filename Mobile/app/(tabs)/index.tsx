import { View, Text, Image, ScrollView, RefreshControl } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import SignOutButton from "@/components/SignOutButton";
import { useUserSync } from "@/hooks/useUserSync";
import { Ionicons } from "@expo/vector-icons";
import PostComposer from "@/components/PostComposer";
import PostsList from "@/components/PostsList";
import { usePosts } from "@/hooks/usePosts";

const HomeScreen = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { refetch: refetchPosts } = usePosts();

  const handlePullToRefresh = async () => {
    setIsRefreshing(true);

    await refetchPosts();
    setIsRefreshing(false);
  };

  useUserSync();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100">
        <Image
          source={require("@/assets/images/xMind-Logo1.png")}
          style={{ width: 24, height: 24 }}
          resizeMode="contain"
        />
        <Text className="text-xl font-bold text-gray-900">Home</Text>
        <SignOutButton />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 80 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handlePullToRefresh}
            tintColor={"#7E57C2"}
            title="Getting latest posts..."
            titleColor={"#B0BEC5"}
          />
        }
      >
        <PostComposer />
        <PostsList />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
