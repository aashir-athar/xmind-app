import { useMemo } from "react";

import { usePosts } from "./usePosts";
import { useCurrentUser } from "./useCurrentUser";
import {
  rankFeedPosts,
  simpleRankPosts,
  type FeedRankingWeights,
} from "@/utils/feedRanking";

export interface UseFeedRankingOptions {
  /** When true, runs the multi-factor ranker; otherwise sorts by recency-weighted velocity. */
  useAdvancedAlgorithm?: boolean;
  /** Page-size cap. The server already paginates, this is a UI safety cap. */
  maxPosts?: number;
  /** Optional weight overrides; pass a stable reference. */
  customWeights?: FeedRankingWeights;
}

const DEFAULT_WEIGHTS = {
  engagementLikelihood: 0.4,
  recency: 0.3,
  connectionStrength: 0.15,
  diversity: 0.1,
  quality: 0.05,
} as const satisfies FeedRankingWeights;

/**
 * Feed-ranking hook. Wraps `usePosts` and applies the client-side ranker
 * over the fetched page. The previous version recomputed on every Home
 * render because the options object was rebuilt inline at the call site
 * — including a fresh `customWeights` object — which broke the `useMemo`
 * dependency check. We now memoise the weights with stable structural
 * keys so the ranker only re-runs when the inputs really change.
 */
export const useFeedRanking = (options: UseFeedRankingOptions = {}) => {
  const useAdvancedAlgorithm = options.useAdvancedAlgorithm ?? true;
  const maxPosts = options.maxPosts ?? 25;
  const customWeights = options.customWeights;

  // Stable signature for the weights object: derive a string key so the
  // memoised `weights` only changes when the numbers change, not when the
  // parent re-renders.
  const weightsKey = useMemo(() => {
    if (!customWeights) return "default";
    return [
      customWeights.engagementLikelihood ?? DEFAULT_WEIGHTS.engagementLikelihood,
      customWeights.recency ?? DEFAULT_WEIGHTS.recency,
      customWeights.connectionStrength ?? DEFAULT_WEIGHTS.connectionStrength,
      customWeights.diversity ?? DEFAULT_WEIGHTS.diversity,
      customWeights.quality ?? DEFAULT_WEIGHTS.quality,
    ].join("|");
  }, [
    customWeights?.engagementLikelihood,
    customWeights?.recency,
    customWeights?.connectionStrength,
    customWeights?.diversity,
    customWeights?.quality,
  ]);

  const weights = useMemo<Required<FeedRankingWeights>>(
    () => ({ ...DEFAULT_WEIGHTS, ...(customWeights ?? {}) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weightsKey]
  );

  const { posts, isLoading, error, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePosts();
  const { currentUser } = useCurrentUser();

  const rankedPosts = useMemo(() => {
    if (!posts || posts.length === 0) return [];
    if (!currentUser) return posts.slice(0, maxPosts);

    try {
      if (useAdvancedAlgorithm) {
        return rankFeedPosts(posts, currentUser, [], {
          weights,
          limits: {
            maxPostsPerFeed: maxPosts,
            maxPostsPerAccount: 2,
            adFrequency: 5,
          },
        }).slice(0, maxPosts);
      }
      return simpleRankPosts(posts).slice(0, maxPosts);
    } catch (rankError) {
      if (__DEV__) console.error("[feedRanking] error:", rankError);
      return simpleRankPosts(posts).slice(0, maxPosts);
    }
  }, [posts, currentUser, useAdvancedAlgorithm, maxPosts, weights]);

  return {
    posts: rankedPosts,
    isLoading,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};
