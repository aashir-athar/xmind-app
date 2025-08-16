import { Redirect, Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";
import CustomTabBar from "@/components/CustomTabBar";

const TabsLayout = () => {
  const insets = useSafeAreaInsets();

  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null; // or a splash/loader
  if (!isSignedIn) return <Redirect href="/(auth)" />;

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="search" />
      <Tabs.Screen name="notifications" />
      <Tabs.Screen name="index" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
};
export default TabsLayout;
