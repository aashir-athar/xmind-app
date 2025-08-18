import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import SignOutButton from "@/components/SignOutButton";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import PostsList from "@/components/PostsList";
import { format } from "date-fns";
import { usePosts } from "@/hooks/usePosts";

const ProfileScreen = () => {
  const { currentUser, isLoading } = useCurrentUser();
  const insets = useSafeAreaInsets();

  const {
    posts: userPosts,
    refetch: refetchPosts,
    isLoading: isRefetching,
  } = usePosts(currentUser?.username);

  if (isLoading || !currentUser._id) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size={"large"} color={"#4527A0"} />
        <Text className="text-textSecondary mt-2">Loading profile...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-textSecondary mt-2">No user found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-borderLight">
        <View>
          <Text className="text-xl font-bold text-textPrimary">
            {currentUser.firstName} {currentUser.lastName}
          </Text>
          <Text className="text-textSecondary text-sm">
            {userPosts.length === 0
              ? "No posts yet"
              : userPosts.length === 1
                ? "1 Post"
                : `${userPosts.length} Posts`}
          </Text>
        </View>
        <SignOutButton />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={
            currentUser.bannerImage
              ? { uri: currentUser.bannerImage }
              : require("../../assets/images/default-banner.jpeg")
          }
          className="w-full h-48"
          resizeMode="cover"
        />
        <View className="px-4 pb-4 border-b border-borderLight bg-surface">
          <View className="flex-row justify-between items-end -mt-16 mb-4">
            <Image
              className="size-32 rounded-full border-4 border-primary"
              source={
                currentUser.profilePicture
                  ? { uri: currentUser.profilePicture }
                  : require("../../assets/images/default-avatar.jpeg")
              }
            />
            <TouchableOpacity className="border border-borderLight px-6 py-2 rounded-full">
              <Text className="font-semibold text-textPrimary">
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>
          <View className="mb-4">
            <View className="flex-row items-center mb-1">
              <Text className="text-xl font-bold text-textPrimary mr-1">
                {currentUser.firstName} {currentUser.lastName}
              </Text>
              <MaterialCommunityIcons
                name="check-decagram"
                size={20}
                color="#4527A0"
              />
            </View>
            <Text className="text-textSecondary mb-2">
              @{currentUser.username}
            </Text>
            <Text className="text-textPrimary mb-3">
              {currentUser.bio || "No bio"}
            </Text>
            <View className="flex-row items-center mb-2">
              <Feather name="map-pin" size={16} color={"#90A4AE"} />
              <Text className="text-textSecondary ml-2">
                {currentUser.location || "No location"}
              </Text>
            </View>
            <View className="flex-row items-center mb-3">
              <Feather name="calendar" size={16} color={"#90A4AE"} />
              <Text className="text-textSecondary ml-2">
                Joined {format(new Date(currentUser.createdAt), "MMMM yyyy")}
              </Text>
            </View>
            <View className="flex-row">
              <TouchableOpacity className="mr-6">
                <Text className="text-textPrimary">
                  <Text className="font-bold">
                    {currentUser.following?.length}
                  </Text>
                  <Text className="text-gray-500"> Following</Text>
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-textPrimary">
                  <Text className="font-bold">
                    {currentUser.followers?.length}
                  </Text>
                  <Text className="text-textPrimary"> Followers</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <PostsList username={currentUser?.username} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
