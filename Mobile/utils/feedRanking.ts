import { Post, User } from "@/types";

// Assuming Post type includes additional fields for better functionality:
// - _id: string;
// - contentType?: 'text' | 'image' | 'video' | 'link';
// - isSponsored?: boolean;
// - topics?: string[]; (optional, for topic-based diversity)
// - video?: string; (similar to image)

// Types for the ranking algorithm
interface UserInteraction {
  userId: string;
  postId: string;
  type: "like" | "comment" | "share" | "view" | "skip";
  timestamp: number;
}

interface UserProfile {
  userId: string;
  interests: string[];
  location?: string;
  followedAccounts: string[];
  blockedAccounts: string[];
  interactionHistory: UserInteraction[];
  preferences: {
    contentTypes: ("text" | "image" | "video")[];
    topics: string[];
    mutedAccounts: string[];
    preferPersonalContent?: boolean;
  };
}

interface PostScore {
  post: Post;
  score: number;
  breakdown: {
    engagementLikelihood: number;
    recencyScore: number;
    connectionStrength: number;
    diversityBoost: number;
    qualityScore: number;
  };
  reason: string;
}

interface FeedRankingConfig {
  weights: {
    engagementLikelihood: number;
    recency: number;
    connectionStrength: number;
    diversity: number;
    quality: number;
  };
  limits: {
    maxPostsPerAccount: number;
    maxPostsPerFeed: number;
    adFrequency: number;
  };
  timeDecay: {
    halfLifeHours: number;
    maxAgeHours: number;
  };
  adPosts?: Post[];
  trendingThreshold?: {
    minEngagement: number;
    maxAgeHours: number;
  };
}

// Default configuration
const DEFAULT_CONFIG: FeedRankingConfig = {
  weights: {
    engagementLikelihood: 0.4,
    recency: 0.3,
    connectionStrength: 0.15,
    diversity: 0.1,
    quality: 0.05,
  },
  limits: {
    maxPostsPerAccount: 2,
    maxPostsPerFeed: 20,
    adFrequency: 5,
  },
  timeDecay: {
    halfLifeHours: 12,
    maxAgeHours: 48,
  },
  trendingThreshold: {
    minEngagement: 10,
    maxAgeHours: 1,
  },
};

export class FeedRankingAlgorithm {
  private config: FeedRankingConfig;
  private userProfile: UserProfile;
  private currentUser: User;

  constructor(
    userProfile: UserProfile,
    currentUser: User,
    config?: Partial<FeedRankingConfig>
  ) {
    this.userProfile = {
      ...userProfile,
      blockedAccounts: userProfile.blockedAccounts || [],
    };
    this.currentUser = currentUser;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main function to rank posts for the feed
   */
  public rankPosts(posts: Post[]): Post[] {
    if (posts.length === 0) return [];

    // Step 1: Filter posts
    const filteredPosts = this.filterPosts(posts);

    // Step 2: Score posts
    const scoredPosts = this.scorePosts(filteredPosts);

    // Step 3: Rank and apply limits
    const rankedPosts = this.rankAndLimitPosts(scoredPosts);

    // Step 4: Balance content types
    const balancedPosts = this.balanceContentTypes(rankedPosts);

    // Step 5: Insert ads
    const finalFeed = this.insertAds(balancedPosts.map((score) => score.post));

    return finalFeed;
  }

  /**
   * Filter out inappropriate, seen, or irrelevant posts
   */
  private filterPosts(posts: Post[]): Post[] {
    return posts.filter((post) => {
      const postId = post._id;
      if (
        this.userProfile.interactionHistory.some(
          (i) => i.postId === postId && i.type === "view"
        )
      ) {
        return false;
      }
      if (
        this.userProfile.preferences.mutedAccounts.includes(post.user._id) ||
        this.userProfile.blockedAccounts.includes(post.user._id)
      ) {
        return false;
      }
      const postAge = Date.now() - new Date(post.createdAt).getTime();
      if (postAge > this.config.timeDecay.maxAgeHours * 60 * 60 * 1000) {
        return false;
      }
      if (this.isLowQualityPost(post)) {
        return false;
      }
      return true;
    });
  }

  /**
   * Score each post based on multiple factors
   */
  private scorePosts(posts: Post[]): PostScore[] {
    return posts.map((post) => {
      let reason = "";
      const engagementLikelihood = this.calculateEngagementLikelihood(
        post,
        reason
      );
      const recencyScore = this.calculateRecencyScore(post, reason);
      const connectionStrength = this.calculateConnectionStrength(post, reason);
      const diversityBoost = this.calculateDiversityBoost(post, reason);
      const qualityScore = this.calculateQualityScore(post, reason);

      const totalScore =
        this.config.weights.engagementLikelihood * engagementLikelihood +
        this.config.weights.recency * recencyScore +
        this.config.weights.connectionStrength * connectionStrength +
        this.config.weights.diversity * diversityBoost +
        this.config.weights.quality * qualityScore;

      return {
        post,
        score: totalScore,
        breakdown: {
          engagementLikelihood,
          recencyScore,
          connectionStrength,
          diversityBoost,
          qualityScore,
        },
        reason,
      };
    });
  }

  /**
   * Calculate engagement likelihood score (0-1)
   */
  private calculateEngagementLikelihood(post: Post, reason: string): number {
    let score = 0;
    const userInterestsSet = new Set(
      this.userProfile.interests.map((i) => i.toLowerCase())
    );
    const contentWords = new Set(
      post.content
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 3)
    );
    const interestMatch = [...contentWords].filter((word) =>
      userInterestsSet.has(word)
    ).length;
    const matchRatio = interestMatch / (userInterestsSet.size || 1);
    score += Math.min(matchRatio * 0.4, 0.4);
    reason += `Engagement: Matched ${interestMatch} interests (ratio: ${matchRatio.toFixed(2)}). `;

    const authorInteractions = this.userProfile.interactionHistory.filter(
      (interaction) => interaction.userId === post.user._id
    );
    const engagementRate =
      authorInteractions.length /
      Math.max(this.userProfile.interactionHistory.length, 1);
    score += Math.min(engagementRate * 0.3, 0.3);
    reason += `Historical engagement rate with author: ${engagementRate.toFixed(2)}. `;

    const engagementCount = post.likes.length + post.comments.length;
    const postAgeHours =
      (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
    const velocity = engagementCount / (postAgeHours + 1);
    score += Math.min(velocity * 0.1, 0.2);
    const engagementRatio = engagementCount / Math.max(engagementCount + 1, 1);
    score += engagementRatio * 0.1;
    reason += `Post engagement velocity: ${velocity.toFixed(2)}. `;

    return Math.min(score, 1);
  }

  /**
   * Calculate recency score (0-1)
   */
  private calculateRecencyScore(post: Post, reason: string): number {
    const postAge = Date.now() - new Date(post.createdAt).getTime();
    const ageHours = postAge / (1000 * 60 * 60);
    let decayScore = 1 / (1 + ageHours / this.config.timeDecay.halfLifeHours);
    if (ageHours > this.config.timeDecay.maxAgeHours) {
      decayScore *= 0.5;
    }
    const engagementCount = post.likes.length + post.comments.length;
    if (
      ageHours < this.config.trendingThreshold.maxAgeHours &&
      engagementCount > this.config.trendingThreshold.minEngagement
    ) {
      decayScore = Math.min(decayScore + 0.2, 1);
      reason += `Trending boost applied (recent with ${engagementCount} engagements). `;
    } else {
      reason += `Recency: Age ${ageHours.toFixed(1)} hours. `;
    }
    return decayScore;
  }

  /**
   * Calculate connection strength score (0-1)
   */
  private calculateConnectionStrength(post: Post, reason: string): number {
    let score = 0;
    if (this.userProfile.followedAccounts.includes(post.user._id)) {
      score += 0.5;
      reason += `Follows author. `;
    }
    if (post.user.followers?.includes(this.currentUser._id)) {
      score += 0.2;
      reason += `Mutual follow. `;
    }
    const userInteractions = this.userProfile.interactionHistory.filter(
      (interaction) => interaction.userId === post.user._id
    );
    const interactionFrequency =
      userInteractions.length /
      Math.max(this.userProfile.interactionHistory.length, 1);
    score += Math.min(interactionFrequency * 0.3, 0.3);
    reason += `Interaction frequency: ${interactionFrequency.toFixed(2)}. `;
    if (
      this.userProfile.preferences.preferPersonalContent &&
      interactionFrequency > 0.5
    ) {
      score += 0.1;
      reason += `Personal content boost. `;
    }
    return Math.min(score, 1);
  }

  /**
   * Calculate diversity boost score (0-1)
   */
  private calculateDiversityBoost(post: Post, reason: string): number {
    let score = 0;
    const recentInteractions = this.userProfile.interactionHistory.filter(
      (interaction) => Date.now() - interaction.timestamp < 24 * 60 * 60 * 1000
    );
    const recentAuthors = new Set(recentInteractions.map((i) => i.userId));
    if (!recentAuthors.has(post.user._id)) {
      score += 0.3;
      reason += `Less-seen author. `;
    }
    const postType = this.getPostContentType(post);
    if (!this.userProfile.preferences.contentTypes.includes(postType)) {
      score += 0.2;
      reason += `Diverse content type (${postType}). `;
    }
    const postTopics =
      (post as any).topics ||
      post.content.toLowerCase().split(/\s+/).slice(0, 5);
    const recentTopics = new Set<string>(); // Placeholder for topic tracking
    const newTopics = postTopics.filter((t: string) => !recentTopics.has(t)).length;
    score += Math.min(newTopics * 0.1, 0.3);
    reason += `New topics: ${newTopics}. `;
    if (Math.random() < 0.1) {
      score += 0.3;
      reason += `Serendipity boost. `;
    }
    return Math.min(score, 1);
  }

  /**
   * Calculate quality score (0-1)
   */
  private calculateQualityScore(post: Post, reason: string): number {
    let score = 0.5;
    if (post.user.verified) {
      score += 0.2;
      reason += `Verified author. `;
    }
    const contentLength = post.content.length;
    if (contentLength > 50 && contentLength < 500) {
      score += 0.1;
    } else if (contentLength < 10) {
      score -= 0.2;
    } else if (contentLength > 1000) {
      score -= 0.1;
    }
    reason += `Content length: ${contentLength}. `;
    const hashtags = post.content.match(/#\w+/g) || [];
    if (hashtags.length > 0 && hashtags.length <= 3) {
      score += 0.1;
    } else if (hashtags.length > 5) {
      score -= 0.2;
    }
    const engagementRatio =
      post.likes.length / Math.max(post.comments.length, 1);
    if (engagementRatio > 2 && engagementRatio < 10) {
      score += 0.1;
    }
    const clickbaitPhrases = [
      "shocking",
      "you won't believe",
      "mind-blowing",
      "secret revealed",
      "this changes everything",
    ];
    const isClickbait = clickbaitPhrases.some((phrase) =>
      post.content.toLowerCase().includes(phrase)
    );
    if (isClickbait) {
      score -= 0.3;
      reason += `Clickbait detected. `;
    }
    return Math.max(0, Math.min(score, 1));
  }

  /**
   * Check if a post is low quality
   */
  private isLowQualityPost(post: Post): boolean {
    if (post.content.length < 5) return true;
    const hashtags = post.content.match(/#\w+/g) || [];
    if (hashtags.length > 8) return true;
    const upperCaseRatio =
      post.content.replace(/[^A-Z]/g, "").length / post.content.length;
    if (upperCaseRatio > 0.7 && post.content.length > 20) return true;
    const repetitivePattern = /(.)\1{4,}/;
    if (repetitivePattern.test(post.content)) return true;
    if ((post.content.match(/[!?.]{3,}/g) || []).length > 2) return true;
    const urls = post.content.match(/https?:\/\/\S+/g) || [];
    if (urls.length > 3) return true;
    return false;
  }

  /**
   * Rank posts by score and apply limits
   */
  private rankAndLimitPosts(scoredPosts: PostScore[]): PostScore[] {
    const sortedPosts = scoredPosts.sort((a, b) => b.score - a.score);
    const accountCounts = new Map<string, number>();
    const limitedPosts: PostScore[] = [];
    for (const scoredPost of sortedPosts) {
      const authorId = scoredPost.post.user._id;
      const currentCount = accountCounts.get(authorId) || 0;
      if (currentCount < this.config.limits.maxPostsPerAccount) {
        limitedPosts.push(scoredPost);
        accountCounts.set(authorId, currentCount + 1);
      }
      if (limitedPosts.length >= this.config.limits.maxPostsPerFeed) {
        break;
      }
    }
    return limitedPosts;
  }

  /**
   * Balance content types based on user preferences
   */
  private balanceContentTypes(scoredPosts: PostScore[]): PostScore[] {
    const userPreferences = this.userProfile.preferences.contentTypes;
    const maxTypeRatio = 0.7;
    const totalPosts = scoredPosts.length;
    const typedPosts = scoredPosts.map((score) => ({
      ...score,
      type: this.getPostContentType(score.post),
    }));
    const typeCounts: { [type: string]: number } = {};
    typedPosts.forEach((p) => {
      typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
    });
    for (const type in typeCounts) {
      while (
        typeCounts[type] / totalPosts > maxTypeRatio &&
        typedPosts.length > 0
      ) {
        const dominantPosts = typedPosts
          .filter((p) => p.type === type)
          .sort((a, b) => a.score - b.score);
        if (dominantPosts.length > 0) {
          const toRemove = dominantPosts[0];
          typedPosts.splice(
            typedPosts.findIndex((p) => p === toRemove),
            1
          );
          typeCounts[type]--;
        }
      }
    }
    return typedPosts.sort((a, b) => b.score - a.score);
  }

  /**
   * Helper to get post content type
   */
  private getPostContentType(post: Post): "text" | "image" | "video" {
    if ((post as any).video) return "video";
    if (post.image && post.image.length > 0) return "image";
    return "text";
  }

  /**
   * Insert ads into the feed
   */
  private insertAds(organicPosts: Post[]): Post[] {
    if (!this.config.adPosts || this.config.adPosts.length === 0)
      return organicPosts;
    const finalFeed: Post[] = [];
    let adIndex = 0;
    const adFreq = this.config.limits.adFrequency;
    organicPosts.forEach((post, index) => {
      if ((index + 1) % adFreq === 0 && adIndex < this.config.adPosts.length) {
        finalFeed.push(this.config.adPosts[adIndex]);
        adIndex++;
      }
      finalFeed.push(post);
    });
    while (
      adIndex < this.config.adPosts.length &&
      finalFeed.length < this.config.limits.maxPostsPerFeed
    ) {
      finalFeed.push(this.config.adPosts[adIndex]);
      adIndex++;
    }
    return finalFeed.slice(0, this.config.limits.maxPostsPerFeed);
  }

  /**
   * Get ranking breakdown for debugging/transparency
   */
  public getRankingBreakdown(posts: Post[]): PostScore[] {
    const filteredPosts = this.filterPosts(posts);
    return this.scorePosts(filteredPosts);
  }

  /**
   * Update user profile with new interaction
   */
  public updateInteraction(interaction: UserInteraction): void {
    this.userProfile.interactionHistory.push(interaction);
  }
}

export function rankFeedPosts(
  posts: Post[],
  currentUser: User,
  userInteractions: UserInteraction[] = [],
  config?: Partial<FeedRankingConfig>
): Post[] {
  const userProfile: UserProfile = {
    userId: currentUser._id,
    interests: [],
    followedAccounts: currentUser.following || [],
    blockedAccounts: [],
    interactionHistory: userInteractions,
    preferences: {
      contentTypes: ["text", "image", "video"],
      topics: [],
      mutedAccounts: [],
    },
  };
  const algorithm = new FeedRankingAlgorithm(userProfile, currentUser, config);
  return algorithm.rankPosts(posts);
}

export function simpleRankPosts(posts: Post[]): Post[] {
  return posts.sort((a, b) => {
    const aAge =
      (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60);
    const bAge =
      (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60);
    const aVelocity = (a.likes.length + a.comments.length) / (aAge + 1);
    const bVelocity = (b.likes.length + b.comments.length) / (bAge + 1);
    return bVelocity - aVelocity;
  });
}
