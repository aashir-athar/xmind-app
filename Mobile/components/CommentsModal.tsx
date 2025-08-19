import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import React, { useEffect } from "react";
import { Comment, Post } from "@/types";
import { useComments } from "@/hooks/useComments";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { BRAND_COLORS } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import { 
  responsiveSize, 
  responsivePadding, 
  responsiveMargin, 
  responsiveBorderRadius, 
  responsiveFontSize, 
  responsiveIconSize,
  baseScale 
} from "@/utils/responsive";

const { width, height } = Dimensions.get("window");

interface CommentsModalProps {
  selectedPost: Post | null;
  onClose: () => void;
}

const CommentsModal = ({ selectedPost, onClose }: CommentsModalProps) => {
  const { commentText, setCommentText, createComment, deleteComment, isCreatingComment, isDeletingComment } =
    useComments();
  const { currentUser } = useCurrentUser();
  const insets = useSafeAreaInsets();

  // Animation values
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.9);
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    if (selectedPost) {
      modalOpacity.value = withTiming(1, { duration: 300 });
      modalScale.value = withSpring(1, { damping: 15 });
      headerOpacity.value = withDelay(150, withTiming(1, { duration: 200 }));
      contentOpacity.value = withDelay(250, withTiming(1, { duration: 400 }));
    } else {
      modalOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0.9, { duration: 200 });
      headerOpacity.value = withTiming(0, { duration: 100 });
      contentOpacity.value = withTiming(0, { duration: 100 });
    }
  }, [selectedPost]);

  const handleClose = () => {
    onClose();
    setCommentText("");
  };

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      {
        translateY: interpolate(headerOpacity.value, [0, 1], [-10 * baseScale, 0]),
      },
    ],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [
      {
        translateY: interpolate(contentOpacity.value, [0, 1], [20 * baseScale, 0]),
      },
    ],
  }));

  const renderContentWithHashtagsAndNewlines = (content: string) => {
    return content.split("\n").map((line, lineIndex) => (
      <Text key={lineIndex} style={{ flexWrap: "wrap" }}>
        {line.split(/\s+/).map((word, wordIndex) => {
          if (word.startsWith("#")) {
            return (
              <Text
                key={`${lineIndex}-${wordIndex}`}
                style={{
                  color: BRAND_COLORS.PRIMARY,
                  fontWeight: "600",
                }}
                onPress={() => console.log(`Clicked hashtag: ${word}`)}
              >
                {word + " "}
              </Text>
            );
          }
          return (
            <Text
              key={`${lineIndex}-${wordIndex}`}
              style={{
                color: BRAND_COLORS.TEXT_PRIMARY,
              }}
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
      animationType="none"
      presentationStyle="pageSheet"
      transparent={true}
      style={{ flex: 1 }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: `${BRAND_COLORS.PRIMARY_DARK}40`,
        }}
      >
        <BlurView
          intensity={20}
          tint="dark"
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Animated.View
            style={[
              {
                flex: 1,
                width: width - responsiveSize(32),
                maxHeight: height * 0.8,
                borderRadius: responsiveBorderRadius(28),
                overflow: "hidden",
                shadowColor: BRAND_COLORS.PRIMARY,
                shadowOffset: { width: 0, height: responsiveSize(20) },
                shadowOpacity: 0.3,
                shadowRadius: responsiveSize(30),
                elevation: 20,
              },
              modalAnimatedStyle,
            ]}
          >
            <LinearGradient
              colors={[BRAND_COLORS.SURFACE, `${BRAND_COLORS.BACKGROUND}95`]}
              style={{ flex: 1 }}
            >
              {/* Enhanced Header */}
              <Animated.View style={headerAnimatedStyle}>
                <BlurView
                  intensity={10}
                  tint="light"
                  style={{ paddingHorizontal: responsivePadding(24), paddingVertical: responsivePadding(20) }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <TouchableOpacity
                      onPress={handleClose}
                      style={{
                        paddingHorizontal: responsivePadding(16),
                        paddingVertical: responsivePadding(8),
                        borderRadius: responsiveBorderRadius(20),
                        backgroundColor: `${BRAND_COLORS.BORDER_LIGHT}20`,
                      }}
                    >
                      <Text
                        style={{
                          color: BRAND_COLORS.TEXT_SECONDARY,
                          fontSize: responsiveFontSize(16),
                          fontWeight: "600",
                        }}
                      >
                        Close
                      </Text>
        </TouchableOpacity>

                    <View
                      style={{
                        paddingHorizontal: responsivePadding(20),
                        paddingVertical: responsivePadding(8),
                        borderRadius: responsiveBorderRadius(20),
                        backgroundColor: `${BRAND_COLORS.PRIMARY}15`,
                        borderWidth: 1,
                        borderColor: `${BRAND_COLORS.PRIMARY}20`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: responsiveFontSize(18),
                          fontWeight: "800",
                          color: BRAND_COLORS.TEXT_PRIMARY,
                          letterSpacing: 0.5,
                        }}
                      >
                        Comments
                      </Text>
      </View>

                    <View style={{ width: responsiveSize(80) }} />
                  </View>
                </BlurView>
              </Animated.View>

              {/* Enhanced Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={insets.bottom + responsiveSize(60)}
                style={{ flex: 1 }}
              >
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                  <Animated.View style={[{ padding: responsivePadding(24) }, contentAnimatedStyle]}>
                    {selectedPost && (
                      <>
                        {/* Post Preview */}
                        <View
                          style={{
                            borderBottomWidth: 1,
                            borderBottomColor: `${BRAND_COLORS.BORDER_LIGHT}30`,
                            backgroundColor: `${BRAND_COLORS.BACKGROUND}80`,
                            padding: responsivePadding(20),
                            borderRadius: responsiveBorderRadius(20),
                            marginBottom: responsiveMargin(24),
                            shadowColor: BRAND_COLORS.PRIMARY,
                            shadowOffset: { width: 0, height: responsiveSize(2) },
                            shadowOpacity: 0.05,
                            shadowRadius: responsiveSize(4),
                            elevation: 2,
                          }}
                        >
                          <View style={{ flexDirection: "row" }}>
                <Image
                  source={{ uri: selectedPost.user.profilePicture }}
                              style={{
                                width: responsiveSize(48),
                                height: responsiveSize(48),
                                borderRadius: responsiveBorderRadius(24),
                                marginRight: responsiveMargin(12),
                              }}
                            />

                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: responsiveMargin(4) }}>
                                <Text
                                  style={{
                                    fontWeight: "700",
                                    marginRight: responsiveMargin(4),
                                    color: BRAND_COLORS.TEXT_PRIMARY,
                                    fontSize: responsiveFontSize(16),
                                  }}
                                >
                      {selectedPost.user.firstName} {selectedPost.user.lastName}
                    </Text>
                                <Text
                                  style={{
                                    color: BRAND_COLORS.TEXT_SECONDARY,
                                    marginLeft: responsiveMargin(4),
                                    fontSize: responsiveFontSize(14),
                                  }}
                                >
                      @{selectedPost.user.username}
                    </Text>
                  </View>
                  {selectedPost?.content && (
                                <Text
                                  style={{
                                    color: BRAND_COLORS.TEXT_PRIMARY,
                                    fontSize: responsiveFontSize(15),
                                    lineHeight: responsiveSize(22),
                                    marginBottom: responsiveMargin(12),
                                  }}
                                >
                                  {renderContentWithHashtagsAndNewlines(selectedPost.content)}
                    </Text>
                  )}
                  {selectedPost?.image && (
                    <Image
                      source={{ uri: selectedPost.image }}
                                  style={{
                                    width: "100%",
                                    height: responsiveSize(192),
                                    borderRadius: responsiveBorderRadius(16),
                                    marginBottom: responsiveMargin(12),
                                  }}
                      resizeMode="cover"
                    />
                  )}
                </View>
              </View>
            </View>

                        {/* Comments List */}
            {selectedPost.comments && selectedPost.comments.length > 0 ? (
                          <View style={{ gap: responsiveSize(16) }}>
                            {selectedPost.comments.map((comment: Comment) => (
                              <View
                                key={comment._id}
                                style={{
                                  backgroundColor: `${BRAND_COLORS.BACKGROUND}80`,
                                  padding: responsivePadding(20),
                                  borderRadius: responsiveBorderRadius(20),
                                  borderWidth: 1,
                                  borderColor: `${BRAND_COLORS.BORDER_LIGHT}30`,
                                  shadowColor: BRAND_COLORS.PRIMARY,
                                  shadowOffset: { width: 0, height: responsiveSize(2) },
                                  shadowOpacity: 0.05,
                                  shadowRadius: responsiveSize(4),
                                  elevation: 2,
                                }}
                              >
                                <View style={{ flexDirection: "row" }}>
                      <Image
                                    style={{
                                      width: responsiveSize(40),
                                      height: responsiveSize(40),
                                      borderRadius: responsiveBorderRadius(20),
                                      marginRight: responsiveMargin(12),
                                    }}
                                    source={{ uri: comment.user.profilePicture }}
                                  />
                                  <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: responsiveMargin(4) }}>
                                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <Text
                                          style={{
                                            fontWeight: "700",
                                            color: BRAND_COLORS.TEXT_PRIMARY,
                                            marginRight: responsiveMargin(4),
                                            fontSize: responsiveFontSize(15),
                                          }}
                                        >
                                          {comment.user.firstName} {comment.user.lastName}
                          </Text>
                                        <Text
                                          style={{
                                            color: BRAND_COLORS.TEXT_SECONDARY,
                                            marginLeft: responsiveMargin(4),
                                            fontSize: responsiveFontSize(13),
                                          }}
                                        >
                                          @{comment.user.username}
                          </Text>
                        </View>
                                      {currentUser?._id === comment.user._id && (
                                        <TouchableOpacity
                                          onPress={() => deleteComment(comment._id)}
                                          disabled={isDeletingComment}
                                          style={{
                                            width: responsiveSize(32),
                                            height: responsiveSize(32),
                                            borderRadius: responsiveBorderRadius(16),
                                            backgroundColor: `${BRAND_COLORS.DANGER}15`,
                                            justifyContent: "center",
                                            alignItems: "center",
                                          }}
                                        >
                                          <Feather
                                            name="trash"
                                            size={responsiveIconSize(16)}
                                            color={BRAND_COLORS.DANGER}
                                          />
                                        </TouchableOpacity>
                                      )}
                                    </View>
                                    <Text
                                      style={{
                                        color: BRAND_COLORS.TEXT_PRIMARY,
                                        fontSize: responsiveFontSize(15),
                                        lineHeight: responsiveSize(22),
                                      }}
                                    >
                                      {comment.content}
                        </Text>
                      </View>
                    </View>
                  </View>
                            ))}
                          </View>
                        ) : (
                          <View
                            style={{
                              alignItems: "center",
                              padding: responsivePadding(40),
                              backgroundColor: `${BRAND_COLORS.BACKGROUND}80`,
                              borderRadius: responsiveBorderRadius(20),
                              borderWidth: 1,
                              borderColor: `${BRAND_COLORS.BORDER_LIGHT}30`,
                            }}
                          >
                            <Text style={{ color: BRAND_COLORS.TEXT_SECONDARY, fontSize: responsiveFontSize(16) }}>
                              No comments yet
                            </Text>
              </View>
            )}

                        {/* Comment Input */}
                        <View
                          style={{
                            paddingTop: responsivePadding(24),
                            borderTopWidth: 1,
                            borderTopColor: `${BRAND_COLORS.BORDER_LIGHT}30`,
                            marginTop: responsiveMargin(24),
                          }}
                        >
                          <View style={{ flexDirection: "row" }}>
                <Image
                  source={{ uri: currentUser?.profilePicture }}
                              style={{
                                width: responsiveSize(40),
                                height: responsiveSize(40),
                                borderRadius: responsiveBorderRadius(20),
                                marginRight: responsiveMargin(12),
                              }}
                            />
                            <View style={{ flex: 1 }}>
                              <View
                                style={{
                                  borderRadius: responsiveBorderRadius(16),
                                  backgroundColor: `${BRAND_COLORS.BACKGROUND}80`,
                                  borderWidth: 1,
                                  borderColor: `${BRAND_COLORS.BORDER_LIGHT}60`,
                                  shadowColor: BRAND_COLORS.PRIMARY,
                                  shadowOffset: { width: 0, height: responsiveSize(2) },
                                  shadowOpacity: 0.05,
                                  shadowRadius: responsiveSize(4),
                                  elevation: 2,
                                  marginBottom: responsiveMargin(12),
                                }}
                              >
                  <TextInput
                                  style={{
                                    padding: responsivePadding(16),
                                    fontSize: responsiveFontSize(16),
                                    color: BRAND_COLORS.TEXT_PRIMARY,
                                    fontWeight: "500",
                                    minHeight: responsiveSize(80),
                                    textAlignVertical: "top",
                                  }}
                    placeholder="Write a comment..."
                                  placeholderTextColor={BRAND_COLORS.PLACEHOLDER}
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                    numberOfLines={3}
                  />
                              </View>
                  <TouchableOpacity
                                style={{
                                  paddingHorizontal: responsivePadding(20),
                                  paddingVertical: responsivePadding(12),
                                  borderRadius: responsiveBorderRadius(20),
                                  backgroundColor: commentText.trim() ? BRAND_COLORS.PRIMARY : `${BRAND_COLORS.BORDER_LIGHT}60`,
                                  alignSelf: "flex-start",
                                  shadowColor: BRAND_COLORS.PRIMARY,
                                  shadowOffset: { width: 0, height: responsiveSize(4) },
                                  shadowOpacity: commentText.trim() ? 0.3 : 0,
                                  shadowRadius: responsiveSize(8),
                                  elevation: commentText.trim() ? 6 : 0,
                                }}
                    onPress={() => createComment(selectedPost._id)}
                    disabled={isCreatingComment || !commentText.trim()}
                  >
                    {isCreatingComment ? (
                                  <ActivityIndicator size="small" color={BRAND_COLORS.SURFACE} />
                    ) : (
                      <Text
                                    style={{
                                      fontWeight: "700",
                                      color: commentText.trim() ? BRAND_COLORS.SURFACE : BRAND_COLORS.TEXT_SECONDARY,
                                      fontSize: responsiveFontSize(16),
                                      letterSpacing: 0.3,
                                    }}
                      >
                        Reply
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
                      </>
                    )}
                  </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
            </LinearGradient>
          </Animated.View>
        </BlurView>
      </View>
    </Modal>
  );
};

export default CommentsModal;
