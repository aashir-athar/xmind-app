import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, commentApi } from "@/utils/api";
import { useCustomAlert } from "@/hooks/useCustomAlert";

export const useComments = () => {
  const [commentText, setCommentText] = useState("");
  const api = useApiClient();
  const queryClient = useQueryClient();
  // CommentsModal hosts a <Modal>; nested Modals don't stack in RN, so
  // route alerts through the platform-native Alert.alert.
  const { showError, showInfo, showDeleteConfirmation } = useCustomAlert({
    useNative: true,
  });

  const createCommentMutation = useMutation({
    mutationFn: async ({
      postId,
      content,
    }: {
      postId: string;
      content: string;
    }) => {
      const response = await commentApi.createComment(api, postId, content);
      return response.data;
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => {
      showError("Couldn't send", "We couldn't post that reply. Try once more.");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await commentApi.deleteComment(api, commentId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => {
      showError("Couldn't delete", "We couldn't remove that reply. Try once more.");
    },
  });

  const createComment = (postId: string) => {
    if (!commentText.trim()) {
      showInfo("Reply is empty", "Type something before sending.");
      return;
    }

    createCommentMutation.mutate({
      postId,
      content: commentText.trim(),
    });
  };

  const deleteComment = (commentId: string) => {
    showDeleteConfirmation(
      "Delete this reply?",
      "It won't undo it for people who've already seen it.",
      () => deleteCommentMutation.mutate(commentId)
    );
  };

  return {
    commentText,
    setCommentText,
    createComment,
    deleteComment,
    isCreatingComment: createCommentMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
  };
};
