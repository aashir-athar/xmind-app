import { TouchableOpacity } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";
import { useSignOut } from "@/hooks/useSignOut";

const SignOutButton = () => {
  const { handleSignOut, isSigningOut } = useSignOut();
  return (
    <TouchableOpacity onPress={handleSignOut} disabled={isSigningOut}>
      <Feather name="log-out" size={24} color={"#E0245E"} />
    </TouchableOpacity>
  );
};

export default SignOutButton;
