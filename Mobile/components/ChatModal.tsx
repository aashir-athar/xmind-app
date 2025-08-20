import { ConversationType, MessageType } from "@/data/conversations";
import { Feather } from "@expo/vector-icons";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { BRAND_COLORS } from "@/constants/colors";
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
import {
  responsiveSize,
  responsivePadding,
  responsiveMargin,
  responsiveBorderRadius,
  responsiveFontSize,
  responsiveIconSize,
  baseScale,
} from "@/utils/responsive";
import { useCallback, useEffect, useRef, useState } from "react";

const { width, height } = Dimensions.get("window");
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface ChatModalProps {
  isChatOpen: boolean;
  selectedConversation: ConversationType | null;
  setIsChatOpen: (isOpen: boolean) => void;
  setSelectedConversation: (conversation: ConversationType | null) => void;
  setConversationsList: (
    cb: (prev: ConversationType[]) => ConversationType[]
  ) => void;
}

const ChatModal: React.FC<ChatModalProps> = ({
  isChatOpen,
  selectedConversation,
  setIsChatOpen,
  setSelectedConversation,
  setConversationsList,
}) => {
  const insets = useSafeAreaInsets();
  const [newMessage, setNewMessage] = useState("");
  const messagesRef = useRef<ScrollView>(null);

  // Animation values
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.9);
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const sendButtonScale = useSharedValue(1);

  useEffect(() => {
    if (isChatOpen) {
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
  }, [isChatOpen]);

  useEffect(() => {
    if (!selectedConversation) return;
    setTimeout(() => messagesRef.current?.scrollToEnd({ animated: true }), 100);
  }, [selectedConversation?.messages.length, isChatOpen]);

  const closeChatModal = useCallback(() => {
    modalOpacity.value = withTiming(0, { duration: 200 });
    modalScale.value = withTiming(0.9, { duration: 200 });
    setTimeout(() => {
      setIsChatOpen(false);
      setSelectedConversation(null);
      setNewMessage("");
    }, 200);
  }, []);

  const sendMessage = useCallback(() => {
    const text = newMessage.trim();
    if (!text || !selectedConversation) return;

    sendButtonScale.value = withSpring(0.95, { damping: 15 }, () => {
      sendButtonScale.value = withSpring(1);
    });

    const now = new Date();
    const nextId =
      (selectedConversation.messages[selectedConversation.messages.length - 1]
        ?.id ?? 0) + 1;
    const outgoing = {
      id: nextId,
      text,
      fromUser: true,
      timestamp: now,
      time: "now",
    } as MessageType;

    setConversationsList((prev) => {
      const updated = prev.map((conv) =>
        conv.id === selectedConversation.id
          ? {
              ...conv,
              lastMessage: text,
              time: "now",
              timestamp: now,
              messages: [...conv.messages, outgoing],
            }
          : conv
      );
      return updated.sort(
        (a, b) =>
          (b.timestamp?.getTime?.() ?? 0) - (a.timestamp?.getTime?.() ?? 0)
      );
    });

    if (selectedConversation) {
      setSelectedConversation({
        ...selectedConversation,
            lastMessage: text,
            time: "now",
            timestamp: now,
        messages: [...selectedConversation.messages, outgoing],
      });
          }
    setNewMessage("");
  }, [newMessage, selectedConversation]);

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      {
        translateY: interpolate(
          headerOpacity.value,
          [0, 1],
          [-10 * baseScale, 0]
        ),
      },
    ],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [
      {
        translateY: interpolate(
          contentOpacity.value,
      [0, 1],
          [20 * baseScale, 0]
        ),
      },
    ],
  }));

  const sendButtonAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: sendButtonScale.value }],
  }));

  if (!selectedConversation) return null;

  return (
    <Modal
      visible={isChatOpen}
      animationType="none"
      presentationStyle="pageSheet"
      transparent={true}
      onRequestClose={closeChatModal}
      style={{ flex: 1 }}
    >
      <SafeAreaView
        edges={["top", "bottom"]}
        style={{
          flex: 1,
          backgroundColor: `${BRAND_COLORS.PRIMARY_DARK}40`,
          paddingTop: insets.top, // FIX: Ensures modal is below status bar
        }}
      >
        <BlurView
          intensity={20}
          tint="dark"
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
            <Animated.View
              style={[
                {
                  flex: 1,
                  width: width - responsiveSize(32),
                  maxHeight: height * 0.8,
                  marginTop: insets.top, // FIX: Pushes the modal below the status bar
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
                {/* Header */}
                <Animated.View style={headerAnimatedStyle}>
                  <BlurView
                    intensity={10}
                tint="light"
                style={{
                      paddingHorizontal: responsivePadding(24),
                  paddingVertical: responsivePadding(20),
                  borderBottomWidth: 1,
                  borderBottomColor: `${BRAND_COLORS.BORDER_LIGHT}20`,
                }}
              >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <TouchableOpacity
                        onPress={closeChatModal}
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

                      <View style={{ alignItems: "center" }}>
                        <Text
                          style={{
                            fontSize: responsiveFontSize(18),
                        fontWeight: "800",
                        color: BRAND_COLORS.TEXT_PRIMARY,
                        letterSpacing: 0.3,
                      }}
                    >
                      {selectedConversation.user.name}
                    </Text>
                    <Text
                      style={{
                            fontSize: responsiveFontSize(12),
                        color: BRAND_COLORS.TEXT_SECONDARY,
                            fontWeight: "500",
                            marginTop: responsiveMargin(2),
                          }}
                        >
                          Chat
                    </Text>
                  </View>

                      <View style={{ width: responsiveSize(80) }} />
                </View>
                  </BlurView>
                </Animated.View>

                {/* Messages */}
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                  keyboardVerticalOffset={insets.bottom + responsiveSize(30)}
                  style={{ flex: 1 }}
                >
              <ScrollView
                style={{
                  flex: 1,
                  paddingHorizontal: responsivePadding(20),
                }}
                ref={messagesRef}
                showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
              >
                    <Animated.View style={contentAnimatedStyle}>
                <View style={{ marginBottom: responsiveMargin(20) }}>
                        <View
                    style={{
                      backgroundColor: `${BRAND_COLORS.SURFACE}90`,
                      borderRadius: responsiveBorderRadius(24),
                      padding: responsivePadding(20),
                      marginBottom: responsiveMargin(24),
                      borderWidth: 1,
                      borderColor: `${BRAND_COLORS.BORDER_LIGHT}30`,
                      shadowColor: BRAND_COLORS.PRIMARY,
                            shadowOffset: {
                              width: 0,
                              height: responsiveSize(4),
                            },
                      shadowOpacity: 0.08,
                      shadowRadius: responsiveSize(12),
                      elevation: 6,
                    }}
                  >
                    <View
                      style={{
                        alignItems: "center",
                        marginBottom: responsiveMargin(12),
                      }}
                    >
                      <LinearGradient
                        colors={[
                          BRAND_COLORS.PRIMARY,
                          BRAND_COLORS.PRIMARY_LIGHT,
                        ]}
                        style={{
                          width: responsiveSize(40),
                          height: responsiveSize(40),
                          borderRadius: responsiveBorderRadius(20),
                          justifyContent: "center",
                          alignItems: "center",
                          marginBottom: responsiveMargin(12),
                        }}
                      >
                        <Feather
                          name="star"
                          size={responsiveIconSize(20)}
                          color={BRAND_COLORS.SURFACE}
                        />
                      </LinearGradient>
                    </View>
                    <Text
                      style={{
                        textAlign: "center",
                        color: BRAND_COLORS.TEXT_PRIMARY,
                        fontSize: responsiveFontSize(15),
                        fontWeight: "600",
                        lineHeight: responsiveSize(22),
                      }}
                    >
                      This is the beginning of your conversation with{" "}
                      <Text
                        style={{
                          color: BRAND_COLORS.PRIMARY,
                          fontWeight: "800",
                        }}
                      >
                        {selectedConversation.user.name}
                      </Text>
                    </Text>
                        </View>

                        {selectedConversation.messages.map((message) => (
                          <View
                      key={message.id}
                      style={{
                        flexDirection: "row",
                        marginBottom: responsiveMargin(16),
                        justifyContent: message.fromUser
                          ? "flex-end"
                          : "flex-start",
                      }}
                    >
                      {!message.fromUser && (
                        <View
                          style={{
                            width: responsiveSize(36),
                            height: responsiveSize(36),
                            borderRadius: responsiveBorderRadius(18),
                            marginRight: responsiveMargin(12),
                            overflow: "hidden",
                            borderWidth: 2,
                            borderColor: `${BRAND_COLORS.PRIMARY}20`,
                            shadowColor: BRAND_COLORS.PRIMARY,
                            shadowOffset: {
                              width: 0,
                              height: responsiveSize(2),
                            },
                            shadowOpacity: 0.15,
                            shadowRadius: responsiveSize(4),
                            elevation: 3,
                                  alignItems: "center",
                                  justifyContent: "center",
                          }}
                        >
                          <Image
                                  source={{
                                    uri: selectedConversation.user.avatar,
                                  }}
                            style={{
                              width: responsiveSize(36),
                              height: responsiveSize(36),
                              borderRadius: responsiveBorderRadius(18),
                            }}
                          />
                        </View>
                      )}

                      <View
                        style={{
                          flex: 1,
                          alignItems: message.fromUser
                            ? "flex-end"
                            : "flex-start",
                          maxWidth: "75%",
                        }}
                      >
                        <View
                          style={{
                            borderRadius: responsiveBorderRadius(24),
                            paddingHorizontal: responsivePadding(20),
                            paddingVertical: responsivePadding(14),
                            marginBottom: responsiveMargin(4),
                            shadowColor: message.fromUser
                              ? BRAND_COLORS.PRIMARY
                              : BRAND_COLORS.TEXT_SECONDARY,
                            shadowOffset: {
                              width: 0,
                              height: responsiveSize(3),
                            },
                            shadowOpacity: message.fromUser ? 0.25 : 0.1,
                            shadowRadius: responsiveSize(8),
                            elevation: message.fromUser ? 6 : 3,
                          }}
                        >
                          {message.fromUser ? (
                            <LinearGradient
                              colors={[
                                BRAND_COLORS.PRIMARY,
                                BRAND_COLORS.PRIMARY_LIGHT,
                              ]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                borderRadius: responsiveBorderRadius(24),
                              }}
                            />
                          ) : (
                            <View
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: `${BRAND_COLORS.SURFACE}95`,
                                borderRadius: responsiveBorderRadius(24),
                                borderWidth: 1,
                                borderColor: `${BRAND_COLORS.BORDER_LIGHT}30`,
                              }}
                            />
                          )}
                          <Text
                            style={{
                              color: message.fromUser
                                ? BRAND_COLORS.SURFACE
                                : BRAND_COLORS.TEXT_PRIMARY,
                              fontSize: responsiveFontSize(15),
                              lineHeight: responsiveSize(22),
                                    fontWeight: message.fromUser
                                      ? "600"
                                      : "500",
                              zIndex: 1,
                            }}
                          >
                            {message.text}
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: responsiveFontSize(12),
                            color: BRAND_COLORS.TEXT_SECONDARY,
                            marginHorizontal: responsiveMargin(8),
                            fontWeight: "600",
                          }}
                        >
                          {message.time}
                        </Text>
                      </View>
                          </View>
                  ))}
                </View>
                    </Animated.View>
              </ScrollView>

                  {/* Input */}
                  <Animated.View
                    style={[
                      {
                        paddingHorizontal: responsivePadding(24),
                        paddingTop: responsivePadding(24),
                        borderTopWidth: 1,
                        borderTopColor: `${BRAND_COLORS.BORDER_LIGHT}30`,
                      },
                    ]}
                  >
                    <View
                style={{
                  flexDirection: "row",
                        alignContent: "center",
                        justifyContent: "center",
                }}
              >
                <View
                  style={{
                    flex: 1,
                          borderRadius: responsiveBorderRadius(16),
                          backgroundColor: `${BRAND_COLORS.BACKGROUND}80`,
                          borderWidth: 1,
                          borderColor: `${BRAND_COLORS.BORDER_LIGHT}60`,
                    shadowColor: BRAND_COLORS.PRIMARY,
                          shadowOffset: { width: 0, height: responsiveSize(2) },
                          shadowOpacity: 0.05,
                          shadowRadius: responsiveSize(4),
                          elevation: 2,
                      marginRight: responsiveMargin(12),
                          marginBottom: responsiveMargin(12),
                        }}
                      >
                        <AnimatedTextInput
                    style={{
                            padding: responsivePadding(16),
                      fontSize: responsiveFontSize(16),
                      color: BRAND_COLORS.TEXT_PRIMARY,
                      fontWeight: "500",
                            minHeight: responsiveSize(48),
                            maxHeight: responsiveSize(100),
                            textAlignVertical: "center",
                    }}
                    placeholder="Type your message..."
                    placeholderTextColor={BRAND_COLORS.PLACEHOLDER}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                          numberOfLines={10}
                          scrollEnabled={true}
                        />
                </View>
                      <Animated.View style={[sendButtonAnimatedStyle]}>
                  <TouchableOpacity
                    onPress={sendMessage}
                    disabled={!newMessage.trim()}
                    style={{
                            minWidth: responsiveSize(48),
                            minHeight: responsiveSize(48),
                            borderRadius: responsiveBorderRadius(16),
                            backgroundColor: newMessage.trim()
                              ? BRAND_COLORS.PRIMARY
                              : `${BRAND_COLORS.BORDER_LIGHT}60`,
                          justifyContent: "center",
                          alignItems: "center",
                            shadowColor: BRAND_COLORS.PRIMARY,
                            shadowOffset: {
                              width: 0,
                              height: responsiveSize(4),
                            },
                            shadowOpacity: newMessage.trim() ? 0.3 : 0,
                            shadowRadius: responsiveSize(8),
                            elevation: newMessage.trim() ? 6 : 0,
                        }}
                      >
                        <Feather
                          name="send"
                            size={responsiveIconSize(24)}
                            color={
                              newMessage.trim()
                                ? BRAND_COLORS.SURFACE
                                : BRAND_COLORS.TEXT_SECONDARY
                            }
                          />
                  </TouchableOpacity>
                      </Animated.View>
                    </View>
                </Animated.View>
              </KeyboardAvoidingView>
          </LinearGradient>
        </Animated.View>
          </SafeAreaView>
        </BlurView>
      </SafeAreaView>
    </Modal>
  );
};

export default ChatModal;
