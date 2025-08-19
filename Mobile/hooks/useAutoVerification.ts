import { useEffect, useCallback, useState } from "react";
import { useCurrentUser } from "./useCurrentUser";
import { usePosts } from "./usePosts";
import { useProfileUpdate } from "./useProfileUpdate";
import { useCustomAlert } from "./useCustomAlert";
import {
  checkVerificationEligibility,
  getVerificationProgress,
  getVerificationStatusMessage,
  getVerificationRequirements,
  VerificationResult,
} from "@/utils/verification";

export const useAutoVerification = () => {
  const { currentUser, refetch: refetchUser } = useCurrentUser();
  const { posts: userPosts } = usePosts(currentUser?.username);
  const { updateVerification } = useProfileUpdate();
  const { showSuccess, showInfo } = useCustomAlert();
  
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  // Check verification eligibility whenever user data changes
  useEffect(() => {
    if (currentUser && userPosts) {
      const result = checkVerificationEligibility(currentUser, userPosts.length);
      const progressValue = getVerificationProgress(currentUser, userPosts.length);
      
      setVerificationResult(result);
      setProgress(progressValue);

      // Auto-verify if eligible and not already verified
      if (result.isEligible && !currentUser.verified) {
        handleAutoVerification();
      }
    }
  }, [currentUser, userPosts]);

  // Handle automatic verification
  const handleAutoVerification = useCallback(async () => {
    if (!currentUser || currentUser.verified || !verificationResult?.isEligible) {
      return;
    }

    setIsChecking(true);
    
    try {
      // Automatically verify the user
      const success = await updateVerification(true);
      
      if (success) {
        // Refetch user data to get updated verification status
        await refetchUser();
        
        // Show success message
        showSuccess(
          "🎉 Account Verified!",
          "Congratulations! Your account has been automatically verified. You've met all the requirements!"
        );
      }
    } catch (error) {
      console.error("Auto-verification failed:", error);
      showInfo(
        "Verification Update",
        "Your verification status will be updated shortly. Please refresh your profile."
      );
    } finally {
      setIsChecking(false);
    }
  }, [currentUser, verificationResult, updateVerification, refetchUser, showSuccess, showInfo]);

  // Manual verification check
  const checkVerification = useCallback(() => {
    if (currentUser && userPosts) {
      const result = checkVerificationEligibility(currentUser, userPosts.length);
      const progressValue = getVerificationProgress(currentUser, userPosts.length);
      
      setVerificationResult(result);
      setProgress(progressValue);
      
      return result;
    }
    return null;
  }, [currentUser, userPosts]);

  // Get verification status message
  const getStatusMessage = useCallback(() => {
    if (currentUser && userPosts) {
      return getVerificationStatusMessage(currentUser, userPosts.length);
    }
    return "";
  }, [currentUser, userPosts]);

  // Get missing requirements
  const getMissingRequirements = useCallback(() => {
    if (currentUser && userPosts) {
      return getVerificationRequirements(currentUser, userPosts.length);
    }
    return [];
  }, [currentUser, userPosts]);

  return {
    verificationResult,
    progress,
    isChecking,
    isEligible: verificationResult?.isEligible || false,
    isVerified: currentUser?.verified || false,
    statusMessage: getStatusMessage(),
    missingRequirements: getMissingRequirements(),
    checkVerification,
    handleAutoVerification,
  };
};
