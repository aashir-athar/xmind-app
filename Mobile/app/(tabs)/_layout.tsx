import { Redirect, Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";

const TabsLayout = () => {
  const insets = useSafeAreaInsets();

  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null; // or a splash/loader
  if (!isSignedIn) return <Redirect href="/(auth)" />;

  return (
    <Tabs
      screenOptions={{
        // Active Tab Color (brand coral instead of Twitter blue)
        tabBarActiveTintColor: "#FF5A5F", // Coral Red

        // Inactive Tab Color (soft charcoal for readability)
        tabBarInactiveTintColor: "#8A8A8A", // Medium neutral gray

        tabBarStyle: {
          backgroundColor: "#FFFFFF", // White tab background for light theme
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0", // Softer border than Twitter’s gray
          height: 50 + insets.bottom,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "",

          tabBarIcon: ({ color, size }) => (
            <Feather name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "",

          tabBarIcon: ({ color, size }) => (
            <Feather name="bell" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "",

          tabBarIcon: ({ color, size }) => (
            <Feather name="mail" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};
export default TabsLayout;
