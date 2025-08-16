import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { Post } from "@/types";
import { useComments } from "@/hooks/useComments";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface CommentsModalProps {
  selectedPost: Post | null;
  onClose: () => void;
}

const CommentsModal = ({ selectedPost, onClose }: CommentsModalProps) => {
  const { commentText, setCommentText, createComment, isCreatingComment } =
    useComments();
  const { currentUser } = useCurrentUser();

  const handleClose = () => {
    onClose();
    setCommentText("");
  };

  const renderContentWithHashtagsAndNewlines = (content: string) => {
    return content.split("\n").map((line, lineIndex) => (
      <Text key={lineIndex} className="flex-wrap">
        {line.split(/\s+/).map((word, wordIndex) => {
          if (word.startsWith("#")) {
            return (
              <Text
                key={`${lineIndex}-${wordIndex}`}
                className="text-primary font-semibold"
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
    <Modal
      visible={!!selectedPost}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-borderLight">
        <TouchableOpacity onPress={handleClose}>
          <Text className="text-primary">Close</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold">Comments</Text>
        <View className="w-12" />
      </View>

      {selectedPost && (
        <ScrollView className="flex-1">
          <View className="border-b border-borderLight bg-surface p-4">
            <View className="flex-row">
              <Image
                source={{ uri: selectedPost.user.profilePicture }}
                className="size-12 rounded-full mr-3"
              />

              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="font-bold mr-1 text-textPrimary">
                    {selectedPost.user.firstName} {selectedPost.user.lastName}
                  </Text>
                  <Text className="text-textSecondary ml-1">
                    @{selectedPost.user.username}
                  </Text>
                </View>
                {selectedPost?.content && (
                  <Text className="text-textPrimary text-base leading-5 mb-3">
                    {renderContentWithHashtagsAndNewlines(selectedPost.content)}
                  </Text>
                )}
                {selectedPost?.image && (
                  <Image
                    source={{ uri: selectedPost.image }}
                    className="w-full h-48 rounded-2xl mb-3"
                    resizeMode="cover"
                  />
                )}
              </View>
            </View>
          </View>

          {selectedPost.comments && selectedPost.comments.length > 0 ? (
            selectedPost?.comments.map((comment) => (
              <View
                key={comment._id}
                className="border-b border-borderLight bg-mutedSurface p-4"
              >
                <View className="flex-row">
                  <Image
                    className="w-10 h-10 rounded-full mr-3"
                    source={{ uri: comment.user.profilePicture }}
                  />
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="font-bold text-textPrimary mr-1">
                        {comment.user.firstName} {comment.user.lastName}
                      </Text>
                      <Text className="text-textSecondary text-sm ml-1">
                        @{comment.user.username}
                      </Text>
                    </View>
                    <Text className="text-textPrimary text-base leading-5 mb-2">
                      {comment.content}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="p-4 text-center">
              <Text className="text-textSecondary">No comments yet</Text>
            </View>
          )}

          <View className="p-4 border-t border-borderLight">
            <View className="flex-row">
              <Image
                source={{ uri: currentUser?.profilePicture }}
                className="size-10 rounded-full mr-3"
              />
              <View className="flex-1">
                <TextInput
                  className="border border-borderLight rounded-lg p-3 text-base mb-3"
                  placeholder="Write a comment..."
                  placeholderTextColor={"#B0BEC5"}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  className={`px-4 py-2 rounded-lg self-start ${commentText.trim() ? "bg-primary" : "bg-borderLight"}`}
                  onPress={() => createComment(selectedPost._id)}
                  disabled={isCreatingComment || !commentText.trim()}
                >
                  {isCreatingComment ? (
                    <ActivityIndicator size={"small"} color={"#fff"} />
                  ) : (
                    <Text
                      className={`font-semibold ${commentText.trim() ? "text-white" : "text-textSecondary"}`}
                    >
                      Reply
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </Modal>
  );
};

export default CommentsModal;
