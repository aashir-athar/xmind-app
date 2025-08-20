import { Feather } from "@expo/vector-icons";
import {
  View,
  TextInput,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  withDelay,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { BRAND_COLORS, HEADER_CONFIG } from "@/constants/colors";
import { useSearch } from "@/hooks/useSearch";
import UserSearchResult from "@/components/UserSearchResult";
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
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const SearchScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { trendingHashtags, searchUsers } = useSearch();

  const searchResults = searchUsers(searchQuery);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const searchBarScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);
  const backgroundOpacity = useSharedValue(0);

  useEffect(() => {
    setShowResults(searchQuery.length > 0);
  }, [searchQuery]);

  useEffect(() => {
    // Entrance animations
    headerOpacity.value = withTiming(1, { duration: 400 });
    searchBarScale.value = withSpring(1, { damping: 15 });
    backgroundOpacity.value = withDelay(200, withTiming(0.1, { duration: 600 }));
    contentOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    // Header stays fixed, no scroll effects
  }));

  const searchBarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchBarScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [
      {
        translateY: interpolate(contentOpacity.value, [0, 1], [20 * baseScale, 0]),
      },
    ],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const handleHashtagPress = (hashtag: string) => {
    router.push({
      pathname: "/hashtag-posts",
      params: { hashtag },
    });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setShowResults(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: BRAND_COLORS.BACKGROUND }}>
      {/* Dynamic Background */}
      <Animated.View style={[backgroundAnimatedStyle, { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }]}>
        <LinearGradient
          colors={[`${BRAND_COLORS.PRIMARY}05`, BRAND_COLORS.BACKGROUND]}
          style={{ flex: 1 }}
        />
      </Animated.View>

      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        {/* Enhanced Header */}
        <Animated.View style={headerAnimatedStyle}>
          <BlurView
            intensity={HEADER_CONFIG.BLUR_INTENSITY}
            tint="light"
            style={{ 
              paddingHorizontal: responsivePadding(HEADER_CONFIG.PADDING_HORIZONTAL), 
              paddingVertical: responsivePadding(HEADER_CONFIG.PADDING_VERTICAL),
              paddingTop: responsivePadding(HEADER_CONFIG.PADDING_VERTICAL + 8) // Extra padding for status bar
            }}
          >
            <View className="flex-row items-center justify-between">
              <View style={{ width: responsiveSize(HEADER_CONFIG.BUTTON_SIZE) }} />
              <View className="flex-1 items-center">
                <Text
                  style={{
                    fontSize: responsiveFontSize(HEADER_CONFIG.TITLE_SIZE),
                    fontWeight: "800",
                    color: BRAND_COLORS.TEXT_PRIMARY,
                    letterSpacing: 0.5,
                  }}
                >
                  Search
                </Text>
              </View>
              <View style={{ width: responsiveSize(HEADER_CONFIG.BUTTON_SIZE) }} />
            </View>
          </BlurView>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View style={searchBarAnimatedStyle}>
          <View 
            style={{ 
              paddingHorizontal: responsivePadding(16), 
              paddingVertical: responsivePadding(12) 
            }}
          >
            <View 
              className="flex-row items-center bg-surface rounded-full px-4 py-3"
              style={{
                shadowColor: BRAND_COLORS.PRIMARY,
                shadowOffset: { width: 0, height: responsiveSize(4) },
                shadowOpacity: 0.1,
                shadowRadius: responsiveSize(12),
                elevation: 8,
                borderWidth: 1,
                borderColor: `${BRAND_COLORS.BORDER_LIGHT}40`,
                paddingHorizontal: responsivePadding(16),
                paddingVertical: responsivePadding(12),
                borderRadius: responsiveBorderRadius(24),
              }}
            >
              <Feather name="search" size={responsiveIconSize(20)} color={BRAND_COLORS.PRIMARY} />
          <TextInput
            placeholder="Search xMind..."
            className="flex-1 ml-3 text-base text-textPrimary"
                placeholderTextColor={BRAND_COLORS.TEXT_SECONDARY}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                style={{
                  color: BRAND_COLORS.TEXT_PRIMARY,
                  fontSize: responsiveFontSize(16),
                  fontWeight: "500",
                  marginLeft: responsiveMargin(12),
                }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  onPress={handleClearSearch}
                  style={{
                    width: responsiveSize(32),
                    height: responsiveSize(32),
                    borderRadius: responsiveBorderRadius(16),
                    backgroundColor: `${BRAND_COLORS.PRIMARY}15`,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Feather name="x" size={responsiveIconSize(16)} color={BRAND_COLORS.PRIMARY} />
                </TouchableOpacity>
              )}
        </View>
      </View>
        </Animated.View>

        {/* Content */}
        <AnimatedScrollView
          scrollEventThrottle={16}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: responsiveSize(120) + insets.bottom }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={contentAnimatedStyle}>
            {showResults ? (
              // Search Results
              <View>
                {searchResults.length > 0 ? (
                  <View>
                    <View
                      style={{
                        paddingHorizontal: responsivePadding(20),
                        paddingVertical: responsivePadding(16),
                        backgroundColor: BRAND_COLORS.SURFACE,
                        marginHorizontal: responsiveMargin(12),
                        borderRadius: responsiveBorderRadius(20),
                        shadowColor: BRAND_COLORS.PRIMARY,
                        shadowOffset: { width: 0, height: responsiveSize(4) },
                        shadowOpacity: 0.08,
                        shadowRadius: responsiveSize(12),
                        elevation: 8,
                      }}
                    >
                      <Text 
                        style={{
                          fontSize: responsiveFontSize(18),
                          fontWeight: "700",
                          color: BRAND_COLORS.TEXT_PRIMARY,
                          marginBottom: responsiveMargin(8),
                        }}
                      >
                        Users
                      </Text>
                      <Text
                        style={{
                          fontSize: responsiveFontSize(14),
                          color: BRAND_COLORS.TEXT_SECONDARY,
                        }}
                      >
                        {searchResults.length} {searchResults.length === 1 ? "result" : "results"} found
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: BRAND_COLORS.SURFACE,
                        marginHorizontal: responsiveMargin(12),
                        borderRadius: responsiveBorderRadius(20),
                        marginTop: responsiveMargin(8),
                        shadowColor: BRAND_COLORS.PRIMARY,
                        shadowOffset: { width: 0, height: responsiveSize(4) },
                        shadowOpacity: 0.08,
                        shadowRadius: responsiveSize(12),
                        elevation: 8,
                        overflow: "hidden",
                      }}
                    >
                      {searchResults.map((user) => (
                        <UserSearchResult key={user._id} user={user} />
                      ))}
                    </View>
                  </View>
                ) : (
                  <View 
                    className="flex-1 justify-center items-center py-20"
                    style={{
                      backgroundColor: BRAND_COLORS.SURFACE,
                      marginHorizontal: responsiveMargin(12),
                      borderRadius: responsiveBorderRadius(24),
                      shadowColor: BRAND_COLORS.PRIMARY,
                      shadowOffset: { width: 0, height: responsiveSize(4) },
                      shadowOpacity: 0.08,
                      shadowRadius: responsiveSize(12),
                      elevation: 8,
                      paddingVertical: responsivePadding(80),
                    }}
                  >
                    <View
                      style={{
                        width: responsiveSize(80),
                        height: responsiveSize(80),
                        borderRadius: responsiveBorderRadius(40),
                        backgroundColor: `${BRAND_COLORS.PRIMARY}15`,
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: responsiveMargin(16),
                      }}
                    >
                      <Feather
                        name="search"
                        size={responsiveIconSize(40)}
                        color={BRAND_COLORS.PRIMARY}
                      />
                    </View>
                    <Text 
                      style={{
                        fontSize: responsiveFontSize(20),
                        fontWeight: "700",
                        color: BRAND_COLORS.TEXT_PRIMARY,
                        marginBottom: responsiveMargin(8),
                      }}
                    >
                      No results found
                    </Text>
                    <Text 
                      style={{
                        fontSize: responsiveFontSize(16),
                        color: BRAND_COLORS.TEXT_SECONDARY,
                        textAlign: "center",
                        paddingHorizontal: responsivePadding(32),
                        lineHeight: responsiveSize(24),
                      }}
                    >
                      Try searching for a different username, first name, or last name.
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              // Trending Hashtags
              <View 
                style={{ 
                  paddingHorizontal: responsivePadding(16) 
                }}
              >
                <View
                  style={{
                    backgroundColor: BRAND_COLORS.SURFACE,
                    borderRadius: responsiveBorderRadius(24),
                    padding: responsivePadding(20),
                    marginBottom: responsiveMargin(16),
                    shadowColor: BRAND_COLORS.PRIMARY,
                    shadowOffset: { width: 0, height: responsiveSize(4) },
                    shadowOpacity: 0.08,
                    shadowRadius: responsiveSize(12),
                    elevation: 8,
                  }}
                >
                  <Text 
                    style={{
                      fontSize: responsiveFontSize(22),
                      fontWeight: "800",
                      color: BRAND_COLORS.TEXT_PRIMARY,
                      marginBottom: responsiveMargin(16),
                      letterSpacing: 0.3,
                    }}
                  >
            Trending for you
          </Text>
                  {trendingHashtags.length > 0 ? (
                    trendingHashtags.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="py-3 border-b border-borderLight"
                        style={{
                          borderBottomColor: `${BRAND_COLORS.BORDER_LIGHT}30`,
                          borderBottomWidth: index === trendingHashtags.length - 1 ? 0 : 1,
                          paddingVertical: responsivePadding(12),
                        }}
                        onPress={() => handleHashtagPress(item.hashtag)}
                      >
                        <Text 
                          style={{
                            fontSize: responsiveFontSize(13),
                            color: BRAND_COLORS.TEXT_SECONDARY,
                            marginBottom: responsiveMargin(4),
                            fontWeight: "500",
                          }}
                        >
                          Trending
              </Text>
                        <Text 
                          style={{
                            fontSize: responsiveFontSize(18),
                            fontWeight: "700",
                            color: BRAND_COLORS.PRIMARY,
                            marginBottom: responsiveMargin(4),
                          }}
                        >
                          {item.hashtag}
              </Text>
                        <Text 
                          style={{
                            fontSize: responsiveFontSize(14),
                            color: BRAND_COLORS.TEXT_SECONDARY,
                            fontWeight: "500",
                          }}
                        >
                          {item.count} {item.count === 1 ? "post" : "posts"}
              </Text>
            </TouchableOpacity>
                    ))
                  ) : (
                    <View 
                      style={{ 
                        paddingVertical: responsivePadding(32),
                        alignItems: "center" 
                      }}
                    >
                      <View
                        style={{
                          width: responsiveSize(60),
                          height: responsiveSize(60),
                          borderRadius: responsiveBorderRadius(30),
                          backgroundColor: `${BRAND_COLORS.PRIMARY}10`,
                          justifyContent: "center",
                          alignItems: "center",
                          marginBottom: responsiveMargin(16),
                        }}
                      >
                        <Feather
                          name="hash"
                          size={responsiveIconSize(28)}
                          color={BRAND_COLORS.PRIMARY}
                        />
                      </View>
                      <Text 
                        style={{
                          fontSize: responsiveFontSize(16),
                          color: BRAND_COLORS.TEXT_SECONDARY,
                          textAlign: "center",
                          lineHeight: responsiveSize(24),
                        }}
                      >
                        No hashtags found yet. Start posting with hashtags to see them here!
                      </Text>
                    </View>
                  )}
                </View>
        </View>
            )}
          </Animated.View>
        </AnimatedScrollView>
    </SafeAreaView>
    </View>
  );
};

export default SearchScreen;
