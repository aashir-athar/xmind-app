import { View, Text, Image, ScrollView, RefreshControl } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import SignOutButton from "@/components/SignOutButton";
import { useUserSync } from "@/hooks/useUserSync";
import { Ionicons } from "@expo/vector-icons";
import PostComposer from "@/components/PostComposer";
import PostsList from "@/components/PostsList";
import { usePosts } from "@/hooks/usePosts";
import { BRAND_COLORS } from "@/constants/colors";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const HomeScreen = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { refetch: refetchPosts } = usePosts();

  // Animation values
  const headerOpacity = useSharedValue(1);
  const headerScale = useSharedValue(1);
  const scrollY = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const gradientProgress = useSharedValue(0);

  useEffect(() => {
    // Entrance animation
    headerScale.value = withSpring(1, { damping: 15 });
    logoRotation.value = withSpring(360, { duration: 1000 });
    gradientProgress.value = withTiming(1, { duration: 2000 });
  }, []);

  const handlePullToRefresh = async () => {
    setIsRefreshing(true);
    headerScale.value = withSpring(0.95);

    await refetchPosts();
    setIsRefreshing(false);
    headerScale.value = withSpring(1);
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;

      // Dynamic header effects based on scroll
      const progress = Math.min(event.contentOffset.y / 100, 1);
      headerOpacity.value = interpolate(progress, [0, 1], [1, 0.8]);
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ scale: headerScale.value }],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${logoRotation.value}deg` }],
  }));

  const backgroundGradientStyle = useAnimatedStyle(() => ({
    opacity: interpolate(gradientProgress.value, [0, 1], [0, 0.1]),
  }));

  useUserSync();

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: BRAND_COLORS.BACKGROUND }}
    >
      {/* Dynamic Background Gradient */}
      <Animated.View
        style={[
          { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
          backgroundGradientStyle,
        ]}
      >
        <LinearGradient
          colors={[BRAND_COLORS.PRIMARY, BRAND_COLORS.BACKGROUND]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>

      <SafeAreaView className="flex-1">
        {/* Enhanced Header with Blur Effect */}
        <Animated.View style={headerAnimatedStyle}>
          <BlurView
            intensity={20}
            tint="light"
            style={{ paddingHorizontal: 16, paddingVertical: 12 }}
          >
            <View className="flex-row justify-between items-center">
              <Animated.View style={logoAnimatedStyle}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: BRAND_COLORS.PRIMARY,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: BRAND_COLORS.PRIMARY,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <Image
                    source={require("@/assets/images/xMind-Logo1.png")}
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                </View>
              </Animated.View>

              <View
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: `${BRAND_COLORS.PRIMARY}15`,
                  borderWidth: 1,
                  borderColor: `${BRAND_COLORS.PRIMARY}20`,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: BRAND_COLORS.TEXT_PRIMARY,
                    letterSpacing: 0.5,
                  }}
                >
                  xMind
                </Text>
              </View>

              <SignOutButton />
            </View>
          </BlurView>
        </Animated.View>

        {/* Enhanced ScrollView with Smooth Animations */}
        <AnimatedScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handlePullToRefresh}
              tintColor={BRAND_COLORS.PRIMARY_LIGHT}
              title="Syncing your mind..."
              titleColor={BRAND_COLORS.TEXT_SECONDARY}
              progressBackgroundColor={BRAND_COLORS.SURFACE}
              colors={[BRAND_COLORS.PRIMARY, BRAND_COLORS.PRIMARY_LIGHT]}
            />
          }
        >
          <PostComposer />
          <PostsList />
        </AnimatedScrollView>

        {/* Floating Action Indicator */}
        <Animated.View
          style={{
            position: "absolute",
            bottom: 100,
            right: 20,
            width: 4,
            height: 40,
            borderRadius: 2,
            backgroundColor: BRAND_COLORS.PRIMARY,
            opacity: 0.6,
          }}
        />
      </SafeAreaView>
    </View>
  );
};

export default HomeScreen;
