import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, commentApi } from "@/utils/api";
import { useCustomAlert } from "@/hooks/useCustomAlert";

export const useComments = () => {
  const [commentText, setCommentText] = useState("");
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { showError, showInfo, showDeleteConfirmation } = useCustomAlert();

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
      showError("Error", "Failed to post comment, Try again.");
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
      showError("Error", "Failed to delete comment, Try again.");
    },
  });

  const createComment = (postId: string) => {
    if (!commentText.trim()) {
      showInfo("Empty comment", "Please enter a comment");
      return;
    }

    createCommentMutation.mutate({
      postId,
      content: commentText.trim(),
    });
  };

  const deleteComment = (commentId: string) => {
    showDeleteConfirmation(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
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
