import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import { Post } from "@/types";
import PostCard from "./PostCard";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import CommentsModal from "./CommentsModal";
import { BRAND_COLORS } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";

// New component to handle individual post animations
const AnimatedPostCard = ({
  post,
  index,
  onLike,
  onDelete,
  onComment,
  currentUser,
  isLiked,
}: {
  post: Post;
  index: number;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onComment: (post: Post) => void;
  currentUser: any; // Replace with proper type
  isLiked: boolean;
}) => {
  // Animation values for this specific post
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  // Trigger animation on mount
  useEffect(() => {
    translateY.value = withDelay(index * 100, withSpring(0, { damping: 15 }));
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 400 }));
  }, [index, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <PostCard
        key={post._id}
        post={post}
        onLike={onLike}
        onDelete={onDelete}
        onComment={onComment}
        currentUser={currentUser}
        isLiked={isLiked}
      />
    </Animated.View>
  );
};

const PostsList = ({ username }: { username?: string }) => {
  const { currentUser } = useCurrentUser();
  const {
    posts,
    isLoading,
    error,
    refetch,
    toggleLike,
    deletePost,
    checkIsLiked,
  } = usePosts(username);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Animation values for loading, content, and error states
  const loadingOpacity = useSharedValue(1);
  const contentOpacity = useSharedValue(0);
  const errorOpacity = useSharedValue(0);
  const retryButtonScale = useSharedValue(1);

  useEffect(() => {
    if (!isLoading) {
      loadingOpacity.value = withTiming(0, { duration: 300 });
      if (error) {
        errorOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
      } else {
        contentOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
      }
    }
  }, [isLoading, error, loadingOpacity, contentOpacity, errorOpacity]);

  const selectedPost = selectedPostId
    ? posts.find((p: Post) => p._id === selectedPostId)
    : null;

  const handleRetry = () => {
    retryButtonScale.value = withSpring(0.95, { damping: 15 }, () => {
      retryButtonScale.value = withSpring(1);
      runOnJS(refetch)();
    });
  };

  const loadingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: loadingOpacity.value,
    transform: [
      {
        scale: interpolate(loadingOpacity.value, [1, 0], [1, 0.8]),
      },
    ],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [
      {
        translateY: interpolate(contentOpacity.value, [0, 1], [20, 0]),
      },
    ],
  }));

  const errorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: errorOpacity.value,
    transform: [
      {
        translateY: interpolate(errorOpacity.value, [0, 1], [20, 0]),
      },
    ],
  }));

  const retryButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: retryButtonScale.value }],
  }));

  if (isLoading) {
    return (
      <Animated.View
        style={[
          {
            padding: 40,
            alignItems: "center",
            justifyContent: "center",
          },
          loadingAnimatedStyle,
        ]}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
            shadowColor: BRAND_COLORS.PRIMARY,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <LinearGradient
            colors={[BRAND_COLORS.PRIMARY, BRAND_COLORS.PRIMARY_LIGHT]}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 40,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" color={BRAND_COLORS.SURFACE} />
          </LinearGradient>
        </View>
        <Text
          style={{
            color: BRAND_COLORS.TEXT_SECONDARY,
            fontSize: 16,
            fontWeight: "500",
            letterSpacing: 0.3,
          }}
        >
          Loading minds...
        </Text>
      </Animated.View>
    );
  }

  if (error) {
    return (
      <Animated.View
        style={[
          {
            padding: 40,
            alignItems: "center",
            justifyContent: "center",
          },
          errorAnimatedStyle,
        ]}
      >
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: `${BRAND_COLORS.DANGER}15`,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Feather name="wifi-off" size={24} color={BRAND_COLORS.DANGER} />
        </View>

        <Text
          style={{
            color: BRAND_COLORS.TEXT_SECONDARY,
            fontSize: 16,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Failed to sync minds
        </Text>

        <Animated.View style={retryButtonAnimatedStyle}>
          <TouchableOpacity
            style={{
              paddingHorizontal: 28,
              paddingVertical: 14,
              borderRadius: 24,
              shadowColor: BRAND_COLORS.PRIMARY,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
            }}
            onPress={handleRetry}
          >
            <LinearGradient
              colors={[BRAND_COLORS.PRIMARY, BRAND_COLORS.PRIMARY_LIGHT]}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: BRAND_COLORS.SURFACE,
                  fontSize: 15,
                  fontWeight: "700",
                  letterSpacing: 0.5,
                }}
              >
                Reconnect
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  }

  if (posts.length === 0) {
    return (
      <Animated.View
        style={[
          {
            padding: 40,
            alignItems: "center",
            justifyContent: "center",
          },
          contentAnimatedStyle,
        ]}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: `${BRAND_COLORS.PRIMARY}10`,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
            borderWidth: 2,
            borderColor: `${BRAND_COLORS.PRIMARY}20`,
          }}
        >
          <Feather name="feather" size={32} color={BRAND_COLORS.PRIMARY} />
        </View>
        <Text
          style={{
            color: BRAND_COLORS.TEXT_SECONDARY,
            fontSize: 16,
            textAlign: "center",
            lineHeight: 24,
          }}
        >
          No thoughts shared yet{"\n"}Start expressing your mind!
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ flex: 1 }, contentAnimatedStyle]}>
      <FlashList<Post>
        data={posts}
        renderItem={({ item, index }: ListRenderItemInfo<Post>) => (
          <AnimatedPostCard
            post={item}
            index={index}
            onLike={toggleLike}
            onDelete={deletePost}
            onComment={(post: Post) => setSelectedPostId(post._id)}
            currentUser={currentUser}
            isLiked={checkIsLiked(item.likes, currentUser)}
          />
        )}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
      />

      {selectedPost && (
        <CommentsModal
          selectedPost={selectedPost}
          onClose={() => setSelectedPostId(null)}
        />
      )}
    </Animated.View>
  );
};

export default PostsList;
