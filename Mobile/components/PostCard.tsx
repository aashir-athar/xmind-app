import {
  View,
  Text,
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
import { useRouter } from "expo-router";
import ImageModal from "./ImageModal";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "./CustomAlert";
import {
  responsiveSize,
  responsivePadding,
  responsiveMargin,
  responsiveBorderRadius,
  responsiveFontSize,
  responsiveIconSize,
  baseScale,
} from "@/utils/responsive";

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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
const scale = Math.min(
  Math.max((SCREEN_WIDTH / 430) * (aspectRatio > 2 ? 0.9 : 1), 0.85),
  1.2
);

const PostCard = ({
  currentUser,
  post,
  onLike,
  onDelete,
  onComment,
  isLiked,
}: PostCardProps) => {
  const router = useRouter();
  const { showDeleteConfirmation, alertConfig, isVisible, hideAlert } =
    useCustomAlert();
  const isOwnPost = currentUser ? post.user._id === currentUser._id : false;
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

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
    showDeleteConfirmation(
      "Delete Mind",
      "Are you sure you want to delete this thought?",
      () => {
            deleteScale.value = withSequence(
              withTiming(1.1, { duration: 100 }),
              withTiming(0, { duration: 200 })
            );
        onDelete(post._id);
      }
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

  const handleUserProfilePress = () => {
    avatarScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1.05, { duration: 150 }),
      withTiming(1, { duration: 100 })
    );

    // Check if user is clicking on their own profile
    if (isOwnPost) {
      // Navigate to own profile (tabs/profile)
      router.push("/(tabs)/profile");
    } else {
      // Navigate to other user's profile
      router.push({
        pathname: "/user-profile",
        params: {
          userId: post.user._id,
          username: post.user.username,
        },
      });
    }
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
                onPress={() => {
                  // Keep only the leading hashtag token (letters, numbers, underscore)
                  const match = word.match(/^#[A-Za-z0-9_]+/);
                  const hashtag = match ? match[0] : "";
                  if (!hashtag) return;
                  router.push({
                    pathname: "/hashtag-posts",
                    params: { hashtag },
                  });
                }}
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
    <>
    <Animated.View
      style={[
        {
            marginHorizontal: responsiveMargin(12),
            marginVertical: responsiveMargin(8),
          shadowColor: BRAND_COLORS.PRIMARY,
            shadowOffset: { width: 0, height: responsiveSize(4) },
          shadowOpacity: 0.08,
            shadowRadius: responsiveSize(12),
          elevation: 8,
        },
        cardAnimatedStyle,
      ]}
    >
      <BlurView
        intensity={5}
        tint="light"
          style={{
            borderRadius: responsiveBorderRadius(20),
            overflow: "hidden",
          }}
      >
        <LinearGradient
          colors={[`${BRAND_COLORS.SURFACE}95`, `${BRAND_COLORS.SURFACE}85`]}
            style={{ padding: responsivePadding(20) }}
        >
          {/* Animated Border */}
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                  height: responsiveSize(2),
                backgroundColor: BRAND_COLORS.PRIMARY_LIGHT,
                  borderRadius: responsiveBorderRadius(1),
              },
              borderAnimatedStyle,
            ]}
          />

          <View className="flex-row">
              <TouchableOpacity onPress={handleUserProfilePress}>
              <Animated.View style={[avatarAnimatedStyle]}>
                <View
                  style={{
                      width: responsiveSize(48),
                      height: responsiveSize(48),
                      borderRadius: responsiveBorderRadius(24),
                      marginRight: responsiveMargin(16),
                    overflow: "hidden",
                    borderWidth: 2,
                    borderColor: `${BRAND_COLORS.PRIMARY}25`,
                    shadowColor: BRAND_COLORS.PRIMARY,
                      shadowOffset: { width: 0, height: responsiveSize(2) },
                    shadowOpacity: 0.15,
                      shadowRadius: responsiveSize(4),
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
                      style={{
                        width: responsiveSize(48),
                        height: responsiveSize(48),
                      }}
                    resizeMode="cover"
                  />
                </View>
              </Animated.View>
              </TouchableOpacity>

            <View className="flex-1">
              <Animated.View style={contentAnimatedStyle}>
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center flex-1">
                      <TouchableOpacity onPress={handleUserProfilePress}>
                    <Text
                      style={{
                            fontSize: responsiveFontSize(16),
                        fontWeight: "700",
                        color: BRAND_COLORS.TEXT_PRIMARY,
                      }}
                    >
                      {post.user.firstName} {post.user.lastName}
                    </Text>
                      </TouchableOpacity>
                    {post.user?.verified && (
                      <>
                        <Text> </Text>
                        <View
                          style={{
                              width: responsiveSize(16),
                              height: responsiveSize(16),
                              borderRadius: responsiveBorderRadius(12),
                            backgroundColor: BRAND_COLORS.PRIMARY,
                            justifyContent: "center",
                            alignItems: "center",
                            shadowColor: BRAND_COLORS.PRIMARY,
                              shadowOffset: {
                                width: 0,
                                height: responsiveSize(2),
                              },
                            shadowOpacity: 0.3,
                              shadowRadius: responsiveSize(4),
                          }}
                        >
                          <MaterialCommunityIcons
                            name="check"
                              size={responsiveIconSize(9)}
                            color={BRAND_COLORS.SURFACE}
                          />
                        </View>
                      </>
                    )}
                      <TouchableOpacity onPress={handleUserProfilePress}>
                        <Text
                          style={{
                            fontSize: responsiveFontSize(14),
                            color: BRAND_COLORS.PRIMARY,
                            marginLeft: responsiveMargin(8),
                          }}
                        >
                          @{post.user.username}
                        </Text>
                      </TouchableOpacity>
                    <Text
                      style={{
                          fontSize: responsiveFontSize(14),
                        color: BRAND_COLORS.TEXT_SECONDARY,
                          marginLeft: responsiveMargin(4),
                      }}
                    >
                        • {formatDate(post.createdAt)}
                    </Text>
                  </View>
                  {isOwnPost && (
                    <AnimatedTouchableOpacity
                      style={deleteAnimatedStyle}
                      onPress={handleDelete}
                    >
                      <View
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
                      </View>
                    </AnimatedTouchableOpacity>
                  )}
                </View>

                {post.content && (
                  <Text
                    style={{
                        fontSize: responsiveFontSize(15),
                        lineHeight: responsiveSize(22),
                        marginBottom: responsiveMargin(2),
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
                        marginBottom: responsiveMargin(16),
                        borderRadius: responsiveBorderRadius(16),
                      overflow: "hidden",
                      shadowColor: BRAND_COLORS.PRIMARY,
                        shadowOffset: { width: 0, height: responsiveSize(6) },
                      shadowOpacity: 0.12,
                        shadowRadius: responsiveSize(10),
                      elevation: 6,
                    },
                    imageAnimatedStyle,
                  ]}
                  >
                    <TouchableOpacity
                      onPress={() => setIsImageModalVisible(true)}
                      activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: post.image }}
                        style={{ width: "100%", height: responsiveSize(200) }}
                    resizeMode="cover"
                  />
                    </TouchableOpacity>
                </Animated.View>
              )}

              {/* Enhanced Action Bar */}
              <Animated.View style={[actionBarAnimatedStyle]}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                      maxWidth: responsiveSize(280),
                      paddingTop: responsivePadding(8),
                  }}
                >
                  <AnimatedTouchableOpacity
                    style={[
                      {
                        flexDirection: "row",
                        alignItems: "center",
                          paddingHorizontal: responsivePadding(12),
                          paddingVertical: responsivePadding(8),
                          borderRadius: responsiveBorderRadius(20),
                        backgroundColor: `${BRAND_COLORS.SECONDARY}08`,
                      },
                      commentAnimatedStyle,
                    ]}
                    onPress={handleComment}
                  >
                    <Feather
                      name="message-circle"
                        size={responsiveIconSize(18)}
                      color={BRAND_COLORS.ICON_SECONDARY}
                    />
                    <Text
                      style={{
                        color: BRAND_COLORS.TEXT_SECONDARY,
                          fontSize: responsiveFontSize(13),
                        fontWeight: "600",
                          marginLeft: responsiveMargin(6),
                      }}
                    >
                      {formatNumber(post.comments?.length || 0)}
                    </Text>
                  </AnimatedTouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                        paddingHorizontal: responsivePadding(12),
                        paddingVertical: responsivePadding(8),
                        borderRadius: responsiveBorderRadius(20),
                      backgroundColor: `${BRAND_COLORS.ACCENT_YELLOW}08`,
                    }}
                  >
                    <Feather
                      name="repeat"
                        size={responsiveIconSize(18)}
                      color={BRAND_COLORS.ICON_SECONDARY}
                    />
                    <Text
                      style={{
                        color: BRAND_COLORS.TEXT_SECONDARY,
                          fontSize: responsiveFontSize(13),
                        fontWeight: "600",
                          marginLeft: responsiveMargin(6),
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
                          paddingHorizontal: responsivePadding(12),
                          paddingVertical: responsivePadding(8),
                          borderRadius: responsiveBorderRadius(20),
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
                          size={responsiveIconSize(18)}
                        color={BRAND_COLORS.PRIMARY}
                      />
                    ) : (
                      <Feather
                        name="heart"
                          size={responsiveIconSize(18)}
                        color={BRAND_COLORS.ICON_SECONDARY}
                      />
                    )}
                    <Text
                      style={{
                        color: isLiked
                          ? BRAND_COLORS.PRIMARY
                          : BRAND_COLORS.TEXT_SECONDARY,
                          fontSize: responsiveFontSize(13),
                        fontWeight: "600",
                          marginLeft: responsiveMargin(6),
                      }}
                    >
                      {formatNumber(post.likes?.length || 0)}
                    </Text>
                  </AnimatedTouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                        paddingHorizontal: responsivePadding(12),
                        paddingVertical: responsivePadding(8),
                        borderRadius: responsiveBorderRadius(20),
                      backgroundColor: `${BRAND_COLORS.PRIMARY}08`,
                    }}
                  >
                    <Feather
                      name="share"
                        size={responsiveIconSize(18)}
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

      <ImageModal
        isVisible={isImageModalVisible}
        onClose={() => setIsImageModalVisible(false)}
        imageUrl={post.image || ""}
        imageTitle="Post Image"
      />

      {/* Custom Alert */}
      {alertConfig && (
        <CustomAlert
          visible={isVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          type={alertConfig.type}
          onDismiss={hideAlert}
        />
      )}
    </>
  );
};

export default PostCard;
