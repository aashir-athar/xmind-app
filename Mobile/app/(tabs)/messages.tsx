import {
  CONVERSATIONS,
  ConversationType,
  MessageType,
} from "@/data/conversations";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useMemo } from "react";

const MessagesScreen = () => {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [conversationsList, setConversationsList] = useState(CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationType | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messagesRef = useRef<ScrollView>(null);

  const deleteConversation = (conversationId: number) => {
    Alert.alert(
      "Delete Conversation",
      "Are you sure you want to delete this conversation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setConversationsList((prev) =>
              prev.filter((conv) => conv.id !== conversationId)
            );
            if (selectedConversation?.id === conversationId) {
              setIsChatOpen(false);
              setSelectedConversation(null);
              setNewMessage("");
            }
          },
        },
      ]
    );
  };

  const openConversation = (conversation: ConversationType) => {
    setSelectedConversation(conversation);
    setIsChatOpen(true);
  };

  const closeChatModal = () => {
    setIsChatOpen(false);
    setSelectedConversation(null);
    setNewMessage("");
  };

  const sendMessage = () => {
    const text = newMessage.trim();
    if (!text || !selectedConversation) return;
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
      // Optional: keep most recent conversation on top
      return updated.sort(
        (a, b) =>
          (b.timestamp?.getTime?.() ?? 0) - (a.timestamp?.getTime?.() ?? 0)
      );
    });
    setSelectedConversation((prev) =>
      prev
        ? {
            ...prev,
            lastMessage: text,
            time: "now",
            timestamp: now,
            messages: [...prev.messages, outgoing],
          }
        : prev
    );
    setNewMessage("");
  };

  const filteredConversations = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return conversationsList;
    return conversationsList.filter((c) =>
      [c.user.name, c.user.username, c.lastMessage].some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [searchText, conversationsList]);

  // effect to scroll on new message or when opening chat
  useEffect(() => {
    if (!selectedConversation) return;
    // Delay to ensure layout is committed before scrolling
    setTimeout(() => messagesRef.current?.scrollToEnd({ animated: true }), 0);
  }, [selectedConversation?.messages.length, isChatOpen]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-borderLight">
        <Text className="text-xl font-bold text-textPrimary">Messages</Text>
        <TouchableOpacity>
          <Feather name="edit" size={24} color="#4527A0" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3 border-b border-borderLight">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
          <Feather name="search" size={20} color="#B0BEC5" />
          <TextInput
            placeholder="Search for people and groups"
            className="flex-1 ml-3 text-base text-textPrimary"
            placeholderTextColor="#B0BEC5"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* CONVERSATIONS LIST */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
      >
        {filteredConversations.map((conversation) => (
          <Pressable
            key={conversation.id}
            className="flex-row items-center p-4 border-b border-borderLight pressed:bg-surface"
            onPress={() => openConversation(conversation)}
            onLongPress={() => deleteConversation(conversation.id)}
            style={({ pressed }) => [
              { backgroundColor: pressed ? "#FAFAFA" : "transparent" },
            ]}
          >
            <Image
              source={{ uri: conversation.user.avatar }}
              className="size-12 rounded-full mr-3"
            />

            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center gap-1">
                  <Text className="font-semibold text-textPrimary">
                    {conversation.user.name}
                  </Text>
                  {conversation.user.verified && (
                    <MaterialCommunityIcons
                      name="check-decagram"
                      size={16}
                      color="#4527A0"
                      className="ml-1"
                    />
                  )}
                  <Text className="text-textSecondary text-sm ml-1">
                    @{conversation.user.username}
                  </Text>
                </View>
                <Text className="text-textSecondary text-sm">
                  {conversation.time}
                </Text>
              </View>
              <Text className="text-sm text-textSecondary" numberOfLines={1}>
                {conversation.lastMessage}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Quick Actions */}
      <View className="px-4 py-2 border-t border-borderLight bg-surface">
        <Text className="text-xs text-textSecondary text-center">
          Tap to open • Long press to delete
        </Text>
      </View>

      <Modal
        visible={isChatOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeChatModal}
      >
        {selectedConversation && (
          <SafeAreaView className="flex-1">
            {/* Chat Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-borderLight">
              <TouchableOpacity onPress={closeChatModal} className="mr-3">
                <Feather name="arrow-left" size={24} color="#4527A0" />
              </TouchableOpacity>
              <Image
                source={{ uri: selectedConversation.user.avatar }}
                className="size-10 rounded-full mr-3"
              />
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="font-semibold text-textPrimary mr-1">
                    {selectedConversation.user.name}
                  </Text>
                  {selectedConversation.user.verified && (
                    <MaterialCommunityIcons
                      name="check-decagram"
                      size={16}
                      color="#4527A0"
                      className="ml-1"
                    />
                  )}
                </View>
                <Text className="text-textSecondary text-sm">
                  @{selectedConversation.user.username}
                </Text>
              </View>
            </View>

            {/* Chat Messages Area */}
            <ScrollView className="flex-1 px-4 py-4" ref={messagesRef}>
              <View className="mb-4">
                <Text className="text-center text-textSecondary text-sm mb-4">
                  This is the beginning of your conversation with{" "}
                  {selectedConversation.user.name}
                </Text>

                {/* Conversation Messages */}
                {selectedConversation.messages.map((message) => (
                  <View
                    key={message.id}
                    className={`flex-row mb-3 ${message.fromUser ? "justify-end" : ""}`}
                  >
                    {!message.fromUser && (
                      <Image
                        source={{ uri: selectedConversation.user.avatar }}
                        className="size-8 rounded-full mr-2"
                      />
                    )}
                    <View
                      className={`flex-1 ${message.fromUser ? "items-end" : ""}`}
                    >
                      <View
                        className={`rounded-2xl px-4 py-3 max-w-xs ${
                          message.fromUser ? "bg-primary" : "bg-gray-100"
                        }`}
                      >
                        <Text
                          className={
                            message.fromUser ? "text-white" : "text-textPrimary"
                          }
                        >
                          {message.text}
                        </Text>
                      </View>
                      <Text className="text-xs text-textSecondary mt-1">
                        {message.time}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Message Input */}
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={insets.bottom + 60} // adjust if needed
              className="flex-row items-center px-4 py-3 border-t border-borderLight"
            >
              <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-3 mr-3">
                <TextInput
                  className="flex-1 text-base text-textPrimary"
                  placeholder="Start a message..."
                  placeholderTextColor="#B0BEC5"
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                />
              </View>
              <TouchableOpacity
                onPress={sendMessage}
                className={`size-10 rounded-full items-center justify-center ${
                  newMessage.trim() ? "bg-primary" : "bg-gray-300"
                }`}
                disabled={!newMessage.trim()}
              >
                <Feather name="send" size={20} color="white" />
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default MessagesScreen;
