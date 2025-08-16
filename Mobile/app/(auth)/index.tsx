import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSocialAuth } from "../../hooks/useSocialAuth";

export default function Index() {
  const { handleSocialAuth, isLoading } = useSocialAuth();

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 px-8 justify-between">
        <View className="flex-1 justify-center">
          {/* Demo Image */}
          <View className="items-center">
            <Image
              source={require("../../assets/images/auth.png")}
              className="size-96"
              resizeMode="contain"
            />
          </View>
          <View className="flex-col gap-2">
            <TouchableOpacity
              className="flex-row items-center justify-center bg-background border border-borderLight rounded-full py-3 px-6"
              onPress={() => handleSocialAuth("oauth_apple")}
              disabled={isLoading}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              {isLoading ? (
                <ActivityIndicator size={"small"} color={"#1A1A1A"} />
              ) : (
                <View className="flex-row items-center justify-center">
                  <Image
                    source={require("../../assets/images/apple.png")}
                    className="size-8 mr-3"
                    resizeMode="contain"
                  />
                  <Text className="text-textPrimary font-medium text-base">
                    Continue with Apple
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center justify-center bg-background border border-borderLight rounded-full py-3 px-6"
              onPress={() => handleSocialAuth("oauth_google")}
              disabled={isLoading}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              {isLoading ? (
                <ActivityIndicator size={"small"} color={"#4527A0"} />
              ) : (
                <View className="flex-row items-center justify-center">
                  <Image
                    source={require("../../assets/images/google.png")}
                    className="size-8 mr-3"
                    resizeMode="contain"
                  />
                  <Text className="text-textPrimary font-medium text-base">
                    Continue with Google
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <Text className="text-center text-textSecondary text-xs lead-4 mt-6 px-2">
            By signing up, You agree to our{" "}
            <Text className="text-primary">Terms</Text>
            {", "}
            <Text className="text-primary">Privacy Policy</Text>
            {", and "}
            <Text className="text-primary">Cookie Use</Text>
            {"."}
          </Text>
        </View>
      </View>
    </View>
  );
}
