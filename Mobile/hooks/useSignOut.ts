import { Alert } from "react-native";
import { useState } from "react";
import { useClerk } from "@clerk/clerk-expo";
import { useCallback } from "react";

export const useSignOut = () => {
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const confirmAndSignOut = useCallback(async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (e) {
      console.error("Sign-out failed", e);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  }, [signOut]);

  const handleSignOut = useCallback(() => {
    if (isSigningOut) return;
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => void confirmAndSignOut(),
      },
    ]);
  }, [isSigningOut, confirmAndSignOut]);

  return { handleSignOut, isSigningOut };
};
