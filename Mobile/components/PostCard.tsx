import {
  View,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  withSequence,
  withDelay,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Post, User } from "@/types";
import { formatDate, formatNumber } from "@/utils/formatter";
import { AntDesign, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { BRAND_COLORS } from "@/constants/colors";

const { width } = Dimensions.get("window");

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onComment: (post: Post) => void;
  isLiked?: boolean;
  currentUser: User;
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const PostCard = ({
  currentUser,
  post,
  onLike,
  onDelete,
  onComment,
  isLiked,
}: PostCardProps) => {
  const isOwnPost = currentUser ? post.user._id === currentUser._id : false;

  // Animation values
  const cardScale = useSharedValue(1);
  const cardOpacity = useSharedValue(0);
  const avatarScale = useSharedValue(1);
  const likeScale = useSharedValue(1);
  const commentScale = useSharedValue(1);
  const deleteScale = useSharedValue(1);
  const imageOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const actionBarOpacity = useSharedValue(0);
  const borderOpacity = useSharedValue(0);

  useEffect(() => {
    // Staggered entrance animation
    cardOpacity.value = withTiming(1, { duration: 400 });
    contentOpacity.value = withDelay(100, withTiming(1, { duration: 300 }));
    if (post.image) {
      imageOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    }
    actionBarOpacity.value = withDelay(300, withTiming(1, { duration: 300 }));
    borderOpacity.value = withDelay(400, withTiming(0.6, { duration: 500 }));
  }, []);

  const handleDelete = () => {
    Alert.alert(
      "Delete Mind",
      "Are you sure you want to delete this thought?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteScale.value = withSequence(
              withTiming(1.1, { duration: 100 }),
              withTiming(0, { duration: 200 })
            );
            runOnJS(onDelete)(post._id);
          },
        },
      ]
    );
  };

  const handleLike = () => {
    likeScale.value = withSequence(
      withTiming(1.3, { duration: 150 }),
      withTiming(1, { duration: 200 })
    );
    onLike(post._id);
  };

  const handleComment = () => {
    commentScale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withTiming(1, { duration: 150 })
    );
    onComment(post);
  };

  const handleAvatarPress = () => {
    avatarScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1.05, { duration: 150 }),
      withTiming(1, { duration: 100 })
    );
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const commentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: commentScale.value }],
  }));

  const deleteAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: deleteScale.value }],
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const actionBarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: actionBarOpacity.value,
  }));

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }));

  const renderContentWithHashtagsAndNewlines = (content: string) => {
    return content.split("\n").map((line, lineIndex) => (
      <Text key={lineIndex} className="flex-wrap">
        {line.split(/\s+/).map((word, wordIndex) => {
          if (word.startsWith("#")) {
            return (
              <Text
                key={`${lineIndex}-${wordIndex}`}
                style={{
                  color: BRAND_COLORS.PRIMARY,
                  fontWeight: "700",
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
              style={{ color: BRAND_COLORS.TEXT_PRIMARY }}
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
    <Animated.View
      style={[
        {
          marginHorizontal: 12,
          marginVertical: 8,
          shadowColor: BRAND_COLORS.PRIMARY,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 8,
        },
        cardAnimatedStyle,
      ]}
    >
      <BlurView
        intensity={5}
        tint="light"
        style={{ borderRadius: 20, overflow: "hidden" }}
      >
        <LinearGradient
          colors={[`${BRAND_COLORS.SURFACE}95`, `${BRAND_COLORS.SURFACE}85`]}
          style={{ padding: 20 }}
        >
          {/* Animated Border */}
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                backgroundColor: BRAND_COLORS.PRIMARY_LIGHT,
                borderRadius: 1,
              },
              borderAnimatedStyle,
            ]}
          />

          <View className="flex-row">
            <Pressable onPress={handleAvatarPress}>
              <Animated.View style={[avatarAnimatedStyle]}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    marginRight: 16,
                    overflow: "hidden",
                    borderWidth: 2,
                    borderColor: `${BRAND_COLORS.PRIMARY}25`,
                    shadowColor: BRAND_COLORS.PRIMARY,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={
                      post.user.profilePicture
                        ? { uri: post.user.profilePicture }
                        : require("@/assets/images/default-avatar.jpeg")
                    }
                    style={{ width: 48, height: 48 }}
                    resizeMode="cover"
                  />
                </View>
              </Animated.View>
            </Pressable>

            <View className="flex-1">
              <Animated.View style={contentAnimatedStyle}>
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center flex-1">
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: BRAND_COLORS.TEXT_PRIMARY,
                      }}
                    >
                      {post.user.firstName} {post.user.lastName}
                    </Text>
                    <MaterialCommunityIcons
                      name="check-decagram"
                      size={16}
                      color={BRAND_COLORS.PRIMARY}
                      style={{ marginLeft: 4 }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        color: BRAND_COLORS.TEXT_SECONDARY,
                        marginLeft: 8,
                      }}
                    >
                      @{post.user.username} • {formatDate(post.createdAt)}
                    </Text>
                  </View>
                  {isOwnPost && (
                    <AnimatedTouchableOpacity
                      style={deleteAnimatedStyle}
                      onPress={handleDelete}
                    >
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: `${BRAND_COLORS.DANGER}15`,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Feather
                          name="trash"
                          size={16}
                          color={BRAND_COLORS.DANGER}
                        />
                      </View>
                    </AnimatedTouchableOpacity>
                  )}
                </View>

                {post.content && (
                  <Text
                    style={{
                      fontSize: 15,
                      lineHeight: 22,
                      marginBottom: 16,
                      color: BRAND_COLORS.TEXT_PRIMARY,
                    }}
                  >
                    {renderContentWithHashtagsAndNewlines(post.content)}
                  </Text>
                )}
              </Animated.View>

              {post.image && (
                <Animated.View
                  style={[
                    {
                      marginBottom: 16,
                      borderRadius: 16,
                      overflow: "hidden",
                      shadowColor: BRAND_COLORS.PRIMARY,
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.12,
                      shadowRadius: 10,
                      elevation: 6,
                    },
                    imageAnimatedStyle,
                  ]}
                >
                  <Image
                    source={{ uri: post.image }}
                    style={{ width: "100%", height: 200 }}
                    resizeMode="cover"
                  />
                </Animated.View>
              )}

              {/* Enhanced Action Bar */}
              <Animated.View style={[actionBarAnimatedStyle]}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    maxWidth: 280,
                    paddingTop: 8,
                  }}
                >
                  <AnimatedTouchableOpacity
                    style={[
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: `${BRAND_COLORS.SECONDARY}08`,
                      },
                      commentAnimatedStyle,
                    ]}
                    onPress={handleComment}
                  >
                    <Feather
                      name="message-circle"
                      size={18}
                      color={BRAND_COLORS.ICON_SECONDARY}
                    />
                    <Text
                      style={{
                        color: BRAND_COLORS.TEXT_SECONDARY,
                        fontSize: 13,
                        fontWeight: "600",
                        marginLeft: 6,
                      }}
                    >
                      {formatNumber(post.comments?.length || 0)}
                    </Text>
                  </AnimatedTouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: `${BRAND_COLORS.ACCENT_YELLOW}08`,
                    }}
                  >
                    <Feather
                      name="repeat"
                      size={18}
                      color={BRAND_COLORS.ICON_SECONDARY}
                    />
                    <Text
                      style={{
                        color: BRAND_COLORS.TEXT_SECONDARY,
                        fontSize: 13,
                        fontWeight: "600",
                        marginLeft: 6,
                      }}
                    >
                      0
                    </Text>
                  </TouchableOpacity>

                  <AnimatedTouchableOpacity
                    style={[
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: isLiked
                          ? `${BRAND_COLORS.PRIMARY}12`
                          : `${BRAND_COLORS.ACCENT_MINT}08`,
                      },
                      likeAnimatedStyle,
                    ]}
                    onPress={handleLike}
                  >
                    {isLiked ? (
                      <AntDesign
                        name="heart"
                        size={18}
                        color={BRAND_COLORS.PRIMARY}
                      />
                    ) : (
                      <Feather
                        name="heart"
                        size={18}
                        color={BRAND_COLORS.ICON_SECONDARY}
                      />
                    )}
                    <Text
                      style={{
                        color: isLiked
                          ? BRAND_COLORS.PRIMARY
                          : BRAND_COLORS.TEXT_SECONDARY,
                        fontSize: 13,
                        fontWeight: "600",
                        marginLeft: 6,
                      }}
                    >
                      {formatNumber(post.likes?.length || 0)}
                    </Text>
                  </AnimatedTouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: `${BRAND_COLORS.PRIMARY}08`,
                    }}
                  >
                    <Feather
                      name="share"
                      size={18}
                      color={BRAND_COLORS.ICON_SECONDARY}
                    />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

export default PostCard;
