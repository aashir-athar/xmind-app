import { View, Text, SafeAreaView, Button } from "react-native";
import React from "react";
import { useClerk } from "@clerk/clerk-expo";

const HomeScreen = () => {
  const { signOut } = useClerk();

  return (
    <SafeAreaView>
      <Button onPress={() => signOut()} title="Logout"></Button>
    </SafeAreaView>
  );
};

export default HomeScreen;
