import { View, Text, RefreshControl, Platform, TouchableOpacity, TextInput } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useAnimatedScrollHandler,
  withDelay,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { FlashList } from "@shopify/flash-list";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { BRAND_COLORS, HEADER_CONFIG } from "@/constants/colors";
import {
  responsiveSize,
  responsivePadding,
  responsiveMargin,
  responsiveBorderRadius,
  responsiveFontSize,
  responsiveIconSize,
  baseScale 
} from "@/utils/responsive";
import ChatCard from "@/components/ChatCard";
import ChatModal from "@/components/ChatModal";
import { ConversationType, CONVERSATIONS } from "@/data/conversations";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const MessagesScreen = () => {
  const { showDeleteConfirmation, alertConfig, isVisible, hideAlert } = useCustomAlert();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [conversationsList, setConversationsList] = useState<ConversationType[]>(CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] = useState<ConversationType | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Animation values - simplified like index.tsx
  const headerOpacity = useSharedValue(1);
  const headerScale = useSharedValue(1);
  const scrollY = useSharedValue(0);
  const searchBarScale = useSharedValue(1);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    // Entrance animation matching index.tsx pattern
    headerScale.value = withSpring(1, { damping: 15 });
    contentOpacity.value = withTiming(1, { duration: 800 });
    searchBarScale.value = withDelay(200, withSpring(1, { damping: 15 }));
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    headerScale.value = withSpring(0.95);
    
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsRefreshing(false);
    headerScale.value = withSpring(1);
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  const searchBarAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: searchBarScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const filteredConversations = conversationsList.filter((conversation) =>
    conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: BRAND_COLORS.BACKGROUND }}
    >
      <LinearGradient
          colors={[
          `${BRAND_COLORS.PRIMARY}05`,
            BRAND_COLORS.BACKGROUND,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
      >
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          {/* Header */}
          <AnimatedBlurView
            intensity={HEADER_CONFIG.BLUR_INTENSITY}
            tint="light"
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: responsivePadding(HEADER_CONFIG.PADDING_HORIZONTAL),
                paddingVertical: responsivePadding(HEADER_CONFIG.PADDING_VERTICAL),
                paddingTop: responsivePadding(HEADER_CONFIG.PADDING_VERTICAL + 8), // Extra padding for status bar
                borderBottomWidth: 1,
                borderBottomColor: `${BRAND_COLORS.BORDER_LIGHT}20`,
              },
              headerAnimatedStyle,
            ]}
          >
            <View>
              <Text
                style={{
                  fontSize: responsiveFontSize(HEADER_CONFIG.TITLE_SIZE),
                  fontWeight: "800",
                  color: BRAND_COLORS.TEXT_PRIMARY,
                  letterSpacing: 0.5,
                }}
              >
                Messages
              </Text>
                <Text
                  style={{
                  fontSize: responsiveFontSize(HEADER_CONFIG.SUBTITLE_SIZE),
                  color: BRAND_COLORS.TEXT_SECONDARY,
                  fontWeight: "500",
                  marginTop: responsiveMargin(HEADER_CONFIG.TITLE_MARGIN_BOTTOM),
                }}
              >
                {filteredConversations.length} conversations
                </Text>
              </View>

                  <TouchableOpacity
                    style={{
                      width: responsiveSize(HEADER_CONFIG.BUTTON_SIZE),
                      height: responsiveSize(HEADER_CONFIG.BUTTON_SIZE),
                      borderRadius: responsiveBorderRadius(HEADER_CONFIG.BUTTON_BORDER_RADIUS),
                      backgroundColor: `${BRAND_COLORS.PRIMARY}12`,
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor: `${BRAND_COLORS.PRIMARY}20`,
                      shadowColor: BRAND_COLORS.PRIMARY,
                      shadowOffset: { width: 0, height: responsiveSize(4) },
                      shadowOpacity: 0.2,
                      shadowRadius: responsiveSize(8),
                      elevation: 6,
                    }}
                  >
                    <Feather
                      name="edit-3"
                size={responsiveIconSize(HEADER_CONFIG.ICON_SIZE)}
                      color={BRAND_COLORS.PRIMARY}
                    />
                  </TouchableOpacity>
          </AnimatedBlurView>

          {/* Search Bar */}
          <Animated.View
            style={[
              {
                paddingHorizontal: responsivePadding(20),
                paddingVertical: responsivePadding(16),
              },
              searchBarAnimatedStyle,
            ]}
          >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                backgroundColor: `${BRAND_COLORS.SURFACE}90`,
                  borderRadius: responsiveBorderRadius(28),
                  paddingHorizontal: responsivePadding(20),
                  paddingVertical: responsivePadding(16),
                  borderWidth: 2,
                borderColor: isSearchFocused 
                  ? BRAND_COLORS.PRIMARY 
                  : `${BRAND_COLORS.BORDER_LIGHT}40`,
                  shadowColor: BRAND_COLORS.PRIMARY,
                  shadowOffset: { width: 0, height: responsiveSize(4) },
                shadowOpacity: isSearchFocused ? 0.15 : 0.05,
                  shadowRadius: responsiveSize(12),
                elevation: isSearchFocused ? 6 : 2,
                  }}
                >
                  <Feather
                    name="search"
                    size={responsiveIconSize(20)}
                color={BRAND_COLORS.TEXT_SECONDARY}
                style={{ marginRight: responsiveMargin(12) }}
                  />
                <TextInput
                placeholder="Search conversations..."
                placeholderTextColor={BRAND_COLORS.PLACEHOLDER}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                  style={{
                    flex: 1,
                    fontSize: responsiveFontSize(16),
                    color: BRAND_COLORS.TEXT_PRIMARY,
                  fontWeight: "500",
                  }}
                />
              {searchQuery.length > 0 && (
                  <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                    style={{
                    width: responsiveSize(24),
                    height: responsiveSize(24),
                    borderRadius: responsiveBorderRadius(12),
                    backgroundColor: `${BRAND_COLORS.TEXT_SECONDARY}20`,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Feather
                      name="x"
                    size={responsiveIconSize(14)}
                      color={BRAND_COLORS.TEXT_SECONDARY}
                    />
                  </TouchableOpacity>
                )}
              </View>
        </Animated.View>

          {/* Conversations List */}
        <Animated.View style={[{ flex: 1 }, contentAnimatedStyle]}>
              <FlashList
                data={filteredConversations}
                renderItem={({ item, index }) => (
                  <ChatCard
                    conversation={item}
                  index={index}
                    onPress={() => {
                      setSelectedConversation(item);
                      setIsChatOpen(true);
                    }}
                    onLongPress={() => {
                      showDeleteConfirmation(
                        "Delete Conversation",
                        "This conversation will be permanently deleted.",
                        () => {
                              setConversationsList((prev) =>
                                prev.filter((conv) => conv.id !== item.id)
                              );
                              if (selectedConversation?.id === item.id) {
                                setIsChatOpen(false);
                                setSelectedConversation(null);
                              }
                        }
                      );
                    }}
                  />
                )}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                paddingHorizontal: responsivePadding(16),
                paddingBottom: responsiveSize(100),
              }}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor={BRAND_COLORS.PRIMARY}
                  colors={[BRAND_COLORS.PRIMARY]}
                  progressBackgroundColor={BRAND_COLORS.SURFACE}
                  progressViewOffset={responsiveSize(20)}
                />
              }
            />
              </Animated.View>

          {/* Floating Action Button */}
          <TouchableOpacity
                  style={{
              position: "absolute",
              bottom: responsiveSize(24) + (Platform.OS === "ios" ? 34 : 0),
              right: responsiveSize(24),
              width: responsiveSize(64),
              height: responsiveSize(64),
              borderRadius: responsiveBorderRadius(32),
              backgroundColor: BRAND_COLORS.PRIMARY,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: BRAND_COLORS.PRIMARY,
              shadowOffset: { width: 0, height: responsiveSize(8) },
              shadowOpacity: 0.3,
              shadowRadius: responsiveSize(16),
              elevation: 12,
              }}
            >
              <Feather
                name="plus"
                size={responsiveIconSize(28)}
                color={BRAND_COLORS.SURFACE}
              />
          </TouchableOpacity>
      </SafeAreaView>
      </LinearGradient>

      {/* Chat Modal */}
      <ChatModal
        isChatOpen={isChatOpen}
        selectedConversation={selectedConversation}
        setIsChatOpen={setIsChatOpen}
        setSelectedConversation={setSelectedConversation}
        setConversationsList={setConversationsList}
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
    </View>
  );
};

export default MessagesScreen;
