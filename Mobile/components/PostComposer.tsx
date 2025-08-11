import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { useCreatePost } from "@/hooks/useCreatePost";
import { useUser } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";

const PostComposer = () => {
  const {
    content,
    setContent,
    selectedImage,
    isCreating,
    pickImageFromGallery,
    takePhoto,
    removeImage,
    createPost,
  } = useCreatePost();

  const { user } = useUser();

  return (
    <View className="border-b border-borderLight p-4 bg-background">
      <View className="flex-row">
        <Image
          source={{ uri: user?.imageUrl }}
          className="w-12 h-12 rounded-full mr-3"
        />
        <View className="flex-1">
          <TextInput
            className="text-textPrimary text-lg"
            placeholder="What's on your mind?"
            placeholderTextColor={"#A0A0A0"}
            multiline
            value={content}
            onChangeText={setContent}
            maxLength={300}
          />
        </View>
      </View>

      {selectedImage && (
        <View className="mt-3 ml-15">
          <View className="relative">
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-48 rounded-2xl"
              resizeMode="cover"
            />
            <TouchableOpacity
              className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-40 rounded-full items-center justify-center"
              onPress={removeImage}
            >
              <Feather name="x" size={16} color={"white"} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View className="flex-row justify-between items-center mt-3">
        <View className="flex-row">
          <TouchableOpacity className="mr-4" onPress={pickImageFromGallery}>
            <Feather name="image" size={20} color={"#FF6B57"} />
          </TouchableOpacity>
          <TouchableOpacity className="mr-4" onPress={takePhoto}>
            <Feather name="camera" size={20} color={"#FF6B57"} />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center">
          {content.length > 0 && (
            <Text
              className={`text-sm mr-3 ${
                content.length >= 280
                  ? "text-danger"
                  : content.length >= 220
                    ? "text-warning"
                    : "text-textSecondary"
              }`}
            >
              {300 - content.length}/300
            </Text>
          )}

          <TouchableOpacity
            className={`px-6 py-2 rounded-full ${content.trim() || selectedImage ? "bg-primary" : "bg-borderLight"}`}
            onPress={createPost}
            disabled={isCreating || !(content.trim() || selectedImage)}
          >
            {isCreating ? (
              <ActivityIndicator size={"small"} color={"white"} />
            ) : (
              <Text
                className={`font-semibold ${content.trim() || selectedImage ? "text-white" : "text-textSecondary"}`}
              >
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PostComposer;
