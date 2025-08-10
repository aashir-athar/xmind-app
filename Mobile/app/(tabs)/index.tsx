import { View, Text, Image } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import SignOutButton from "@/components/SignOutButton";
import { useUserSync } from "@/hooks/useUserSync";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = () => {
  useUserSync();
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100">
        <Image
          source={require("@/assets/images/xMind-Logo1.png")}
          style={{ width: 24, height: 24 }}
          resizeMode="contain"
        />
        <Text className="text-xl font-bold text-gray-900">Home</Text>
        <SignOutButton />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
