import { useState } from "react";
import { useClerk } from "@clerk/clerk-expo";
import { useCallback } from "react";
import { useCustomAlert } from "@/hooks/useCustomAlert";

export const useSignOut = () => {
  const { signOut } = useClerk();
  const { showError, showDeleteConfirmation } = useCustomAlert();
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
  }, [signOut]);

  const handleSignOut = useCallback(() => {
    if (isSigningOut) return;
    showDeleteConfirmation(
      "Logout",
      "Are you sure you want to logout?",
      () => void confirmAndSignOut()
    );
  }, [isSigningOut, confirmAndSignOut, showDeleteConfirmation]);

  return { handleSignOut, isSigningOut };
};
