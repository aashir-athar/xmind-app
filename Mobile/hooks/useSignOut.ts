import { useState } from "react";
import { useClerk } from "@clerk/clerk-expo";
import { useCallback } from "react";
import { useCustomAlert } from "@/hooks/useCustomAlert";

export const useSignOut = () => {
  const { signOut } = useClerk();
  const { showError, showSignOutConfirmation, alertConfig, isVisible, hideAlert } = useCustomAlert();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const confirmAndSignOut = useCallback(async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (e) {
      console.error("Sign-out failed", e);
      showError("Error", "Failed to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  }, [signOut, showError]);

  const handleSignOut = useCallback(() => {
    if (isSigningOut) return;
    
    showSignOutConfirmation(
      "Sign Out",
      "Are you sure you want to sign out?",
      confirmAndSignOut
    );
  }, [isSigningOut, confirmAndSignOut, showSignOutConfirmation]);

  return { 
    handleSignOut, 
    isSigningOut,
    alertConfig,
    isVisible,
    hideAlert
  };
};
