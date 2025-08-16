import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import { Post } from "@/types";
import PostCard from "./PostCard";
import {
  FlashList,
  ListRenderItem,
  ListRenderItemInfo,
} from "@shopify/flash-list";
import CommentsModal from "./CommentsModal";

const PostsList = () => {
  const { currentUser } = useCurrentUser();
  const {
    posts,
    isLoading,
    error,
    refetch,
    toggleLike,
    deletePost,
    checkIsLiked,
  } = usePosts();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const selectedPost = selectedPostId
    ? posts.find((p: Post) => p._id === selectedPostId)
    : null;

  if (isLoading) {
    return (
      <View className="p-8 items-center">
        <ActivityIndicator size={"large"} color={"#4527A0"} />
        <Text className="text-textSecondary mt-2">Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="p-8 items-center">
        <Text className="text-textSecondary mb-4">Failed to load posts</Text>
        <TouchableOpacity
          className="bg-primary px-4 py-2 rounded-lg"
          onPress={() => refetch()}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View className="p-8 items-center">
        <Text className="text-textSecondary">No posts yet</Text>
      </View>
    );
  }

  return (
    <>
      <FlashList<Post>
        data={posts}
        renderItem={({ item }: ListRenderItemInfo<Post>) => (
          <PostCard
            key={item._id}
            post={item}
            onLike={toggleLike}
            onDelete={deletePost}
            onComment={(post: Post) => setSelectedPostId(post._id)}
            isLiked={
              currentUser ? checkIsLiked(item.likes, currentUser) : false
            }
            currentUser={currentUser}
          />
        )}
        keyExtractor={(item) => item._id}
      />


      <CommentsModal selectedPost={selectedPost} onClose={() => setSelectedPostId(null)} />
    </>
  );
};

export default PostsList;
