import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";
import { useApiClient, userApi } from "@/utils/api";
import type { AxiosResponse } from "axios";

export const useUserSync = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const api = useApiClient();

  const syncUserMutation = useMutation<AxiosResponse<{ message: string }>>({
    mutationKey: ["user", "sync"],
    mutationFn: () => userApi.syncUser(api),
    retry: 2,
    onSuccess: (response: any) =>
      console.log("User synced successfully:", response.data.message),
    onError: (error) => console.error("User sync failed:", error),
  });

  useEffect(() => {
    if (isLoaded && isSignedIn && syncUserMutation.status === "idle") {
      syncUserMutation.mutate();
    }
  }, [isLoaded, isSignedIn]);

  return null;
};
