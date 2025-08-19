import { useMemo } from "react";
import { usePosts } from "./usePosts";
import { useCurrentUser } from "./useCurrentUser";
import { Post, User } from "@/types";
import {
  rankFeedPosts,
  simpleRankPosts,
  FeedRankingAlgorithm,
} from "../utils/feedRanking";

interface UseFeedRankingOptions {
  useAdvancedAlgorithm?: boolean;
  maxPosts?: number;
  customWeights?: {
    engagementLikelihood?: number;
    recency?: number;
    connectionStrength?: number;
    diversity?: number;
    quality?: number;
  };
}

export const useFeedRanking = (options: UseFeedRankingOptions = {}) => {
  const { useAdvancedAlgorithm = true, maxPosts = 20, customWeights } = options;

  const { posts, isLoading, error, refetch } = usePosts();
  const { currentUser } = useCurrentUser();

  // Rank posts using the algorithm
  const rankedPosts = useMemo(() => {
    if (!posts || !currentUser || posts.length === 0) {
      return [];
    }

    try {
      if (useAdvancedAlgorithm) {
        // Use the advanced feed ranking algorithm
        const ranked = rankFeedPosts(posts, currentUser, [], {
          weights: customWeights || {
            engagementLikelihood: 0.4,
            recency: 0.3,
            connectionStrength: 0.15,
            diversity: 0.1,
            quality: 0.05,
          },
          limits: {
            maxPostsPerFeed: maxPosts,
            maxPostsPerAccount: 2,
            adFrequency: 5,
          },
        });

        // Limit to maxPosts
        return ranked.slice(0, maxPosts);
      } else {
        // Use simple ranking for better performance
        const simpleRanked = simpleRankPosts([...posts]);
        return simpleRankPosts([...posts]).slice(0, maxPosts);
      }
    } catch (error) {
      console.error("Feed ranking error:", error);
      // Fallback to simple ranking if advanced algorithm fails
      return simpleRankPosts(posts).slice(0, maxPosts);
    }
  }, [posts, currentUser, useAdvancedAlgorithm, maxPosts, customWeights]);

  // Get ranking breakdown for debugging/analytics
  const getRankingBreakdown = () => {
    if (!posts || !currentUser || posts.length === 0) {
      return [];
    }

    try {
      // Create a basic user profile for the algorithm
      const userProfile = {
        userId: currentUser._id,
        interests: [], // Could be extracted from user data if available
        followedAccounts: currentUser.following || [],
        interactionHistory: [], // Could be populated from user interactions
        preferences: {
          contentTypes: ["text", "image"] as const,
          topics: [],
          mutedAccounts: [],
        },
      };

      const algorithm = new FeedRankingAlgorithm(userProfile, currentUser, {
        weights: customWeights || {
          engagementLikelihood: 0.4,
          recency: 0.3,
          connectionStrength: 0.15,
          diversity: 0.1,
          quality: 0.05,
        },
        limits: {
          maxPostsPerFeed: maxPosts,
          maxPostsPerAccount: 2,
          adFrequency: 5,
        },
      });

      return algorithm.getRankingBreakdown(posts);
    } catch (error) {
      console.error("Ranking breakdown error:", error);
      return [];
    }
  };

  // Get feed statistics
  const feedStats = useMemo(() => {
    if (!rankedPosts || rankedPosts.length === 0) {
      return {
        totalPosts: 0,
        contentTypes: { text: 0, image: 0, video: 0 },
        averageEngagement: 0,
        topAuthors: [],
        timeRange: { oldest: null, newest: null },
      };
    }

    const contentTypes = rankedPosts.reduce(
      (acc, post) => {
        if (post.image) {
          acc.image++;
        } else {
          acc.text++;
        }
        return acc;
      },
      { text: 0, image: 0, video: 0 }
    );

    const totalEngagement = rankedPosts.reduce(
      (sum, post) => sum + post.likes.length + post.comments.length,
      0
    );

    const averageEngagement = totalEngagement / rankedPosts.length;

    const authorCounts = rankedPosts.reduce(
      (acc, post) => {
        acc[post.user._id] = (acc[post.user._id] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const topAuthors = Object.entries(authorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([userId, count]) => {
        const user = rankedPosts.find((p) => p.user._id === userId)?.user;
        return { user, count };
      });

    const timestamps = rankedPosts.map((post) =>
      new Date(post.createdAt).getTime()
    );
    const timeRange = {
      oldest: timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null,
      newest: timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null,
    };

    return {
      totalPosts: rankedPosts.length,
      contentTypes,
      averageEngagement: Math.round(averageEngagement * 100) / 100,
      topAuthors,
      timeRange,
    };
  }, [rankedPosts]);

  return {
    // Ranked posts
    posts: rankedPosts,

    // Original posts (unranked)
    originalPosts: posts,

    // Loading and error states
    isLoading,
    error,
    refetch,

    // Feed statistics
    feedStats,

    // Utility functions
    getRankingBreakdown,

    // Algorithm options
    algorithmType: useAdvancedAlgorithm ? "advanced" : "simple",
  };
};

// Convenience hook for simple use cases
export const useSimpleFeedRanking = (maxPosts: number = 20) => {
  return useFeedRanking({
    useAdvancedAlgorithm: false,
    maxPosts,
  });
};

// Hook for advanced feed ranking with custom weights
export const useAdvancedFeedRanking = (
  maxPosts: number = 20,
  customWeights?: UseFeedRankingOptions["customWeights"]
) => {
  return useFeedRanking({
    useAdvancedAlgorithm: true,
    maxPosts,
    customWeights,
  });
};
