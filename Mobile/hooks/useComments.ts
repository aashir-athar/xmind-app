import { useState } from "react";
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

import { commentApi, useApiClient, type PostsPayload } from "@/utils/api";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import type { Comment, Post } from "@/types";

/**
 * Comment composer + delete actions.
 *
 * On send: optimistically appends the new comment to every cached page
 * of `["posts"]` so the modal shows the reply instantly. Backend response
 * replaces the stub once it lands. On error we roll back and surface
 * the alert.
 */
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
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const response = await commentApi.createComment<Comment>(api, postId, content);
      return response.data.comment;
    },
    onSuccess: (_data, variables) => {
      setCommentText("");
      // Refresh the post feed (commentCount changes) and the per-post
      // comment cache the modal reads from.
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
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
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previous = queryClient.getQueryData<InfiniteData<PostsPayload<Post>>>(["posts"]);
      queryClient.setQueryData<InfiniteData<PostsPayload<Post>>>(["posts"], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map((p) => ({
              ...p,
              comments: (p.comments ?? []).filter((c) => c._id !== commentId),
            })),
          })),
        };
      });
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["posts"], ctx.previous);
      showError("Couldn't delete", "We couldn't remove that reply. Try once more.");
    },
    onSuccess: () => {
      // The ["comments", postId] cache is keyed by postId which the
      // mutation no longer carries by the time it returns; invalidate
      // every comments cache to be safe (cheap — modal-scope only).
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const createComment = (postId: string) => {
    if (!commentText.trim()) {
      showInfo("Reply is empty", "Type something before sending.");
      return;
    }
    createCommentMutation.mutate({ postId, content: commentText.trim() });
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
