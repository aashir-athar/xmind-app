import { Feather } from "@expo/vector-icons";
import {
  View,
  TextInput,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TRENDING_TOPICS = [
  { topic: "#ReactNative", tweets: "125K" },
  { topic: "#TypeScript", tweets: "89K" },
  { topic: "#WebDevelopment", tweets: "234K" },
  { topic: "#AI", tweets: "567K" },
  { topic: "#TechNews", tweets: "98K" },
  { topic: "#CryptoMarket", tweets: "452K" },
  { topic: "#OpenAI", tweets: "301K" },
  { topic: "#Bitcoin", tweets: "634K" },
  { topic: "#JavaScript", tweets: "210K" },
  { topic: "#MachineLearning", tweets: "178K" },
  { topic: "#CloudComputing", tweets: "92K" },
  { topic: "#NFTCommunity", tweets: "156K" },
  { topic: "#StockMarket", tweets: "276K" },
  { topic: "#CyberSecurity", tweets: "187K" },
  { topic: "#DataScience", tweets: "144K" },
];

const SearchScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* HEADER */}
      <View className="px-4 py-3 border-b border-borderLight">
        <View className="flex-row items-center bg-surface rounded-full px-4 py-3">
          <Feather name="search" size={20} color="#8A8A8A" />
          <TextInput
            placeholder="Search xMind..."
            className="flex-1 ml-3 text-base text-textPrimary"
            placeholderTextColor="#8A8A8A"
          />
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-xl font-bold text-textPrimary mb-4">
            Trending for you
          </Text>
          {TRENDING_TOPICS.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="py-3 border-b border-borderLight"
            >
              <Text className="text-textSecondary text-sm">
                Trending in Technology
              </Text>
              <Text className="font-bold text-textPrimary text-lg">
                {item.topic}
              </Text>
              <Text className="text-textSecondary text-sm">
                {item.tweets} Tweets
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SearchScreen;
