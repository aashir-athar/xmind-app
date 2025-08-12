import { View, Text, Alert, Image, TouchableOpacity } from "react-native";
import React from "react";
import { Post, User } from "@/types";
import { formatDate, formatNumber } from "@/utils/formatter";
import { AntDesign, Feather } from "@expo/vector-icons";

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  isLiked?: boolean;
  currentUser: User;
}

const PostCard = ({
  currentUser,
  post,
  onLike,
  onDelete,
  isLiked,
}: PostCardProps) => {
  const isOwnPost = post.user._id === currentUser._id;
  
  

  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(post._id),
      },
    ]);
  };

  const renderContentWithHashtagsAndNewlines = (content: string) => {
    return content.split("\n").map((line, lineIndex) => (
      <Text key={lineIndex} className="flex-wrap">
        {line.split(/\s+/).map((word, wordIndex) => {
          if (word.startsWith("#")) {
            return (
              <Text
                key={`${lineIndex}-${wordIndex}`}
                className="text-primaryLight"
                onPress={() => console.log(`Clicked hashtag: ${word}`)}
              >
                {word + " "}
              </Text>
            );
          }
          return (
            <Text
              key={`${lineIndex}-${wordIndex}`}
              className="text-textPrimary"
            >
              {word + " "}
            </Text>
          );
        })}
        {"\n"}
      </Text>
    ));
  };

  return (
    <View className="border-b border-borderLight bg-surface">
      <View className="flex-row p-4">
        <Image
          source={{ uri: post.user.profilePicture || "" }}
          className="w-12 h-12 rounded-full mr-3"
        />
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center">
              <Text className="font-bold text-textPrimary">
                {post.user.firstName} {post.user.lastName}
              </Text>
              <Text className="text-textSecondary ml-1">
                @{post.user.username} · {formatDate(post.createdAt)}
              </Text>
            </View>
            {isOwnPost && (
              <TouchableOpacity onPress={handleDelete}>
                <Feather name="trash" color={"#7A7A7A"} />
              </TouchableOpacity>
            )}
          </View>
          {post.content && (
            <Text className="text-base leading-5 mb-3">
              {renderContentWithHashtagsAndNewlines(post.content)}
            </Text>
          )}

          {post.image && (
            <Image
              className="w-full h-48 rounded-2xl mb-3"
              source={{ uri: post.image }}
              resizeMode="cover"
            />
          )}

          <View className="flex-row justify-between max-w-xs">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => {}}
            >
              <Feather name="message-circle" size={18} color={"#7A7A7A"} />
              <Text className="text-textSecondary text-sm ml-2">
                {formatNumber(post.comments?.length || 0)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => {}}
            >
              <Feather name="repeat" size={18} color={"#7A7A7A"} />
              <Text className="text-textSecondary text-sm ml-2">0</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => onLike(post._id)}
            >
              {isLiked ? (
                <AntDesign name="heart" size={18} color={"#FF8A78"} />
              ) : (
                <Feather name="heart" size={18} color={"#7A7A7A"} />
              )}
              <Text className="text-textSecondary text-sm ml-2">
                {formatNumber(post.likes?.length || 0)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => {}}
            >
              <Feather name="share" size={18} color={"#7A7A7A"} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PostCard;
