import { Post, User } from "@/types";

/**
 * Client-side feed ranker.
 *
 * The server returns posts in chronological order; the ranker re-scores
 * them locally using engagement signals + connection strength. Why
 * client-side: it lets the UI personalise without a per-user feed table
 * on the backend, and the ranker is cheap enough (≤100 posts × O(1)
 * scoring) that we can run it on every fresh page.
 *
 * The previous version had a `Math.random()` "serendipity boost" that
 * made the ranking non-deterministic — same inputs produced different
 * orderings on every render. That breaks `useMemo`, breaks scroll
 * position when the data refreshes, and makes the feed feel jittery.
 * Removed.
 */

export interface UserInteraction {
  userId: string;
  postId: string;
  type: "like" | "comment" | "share" | "view" | "skip";
  timestamp: number;
}

export interface UserProfile {
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

export interface FeedRankingWeights {
  engagementLikelihood?: number;
  recency?: number;
  connectionStrength?: number;
  diversity?: number;
  quality?: number;
}

export interface FeedRankingConfig {
  weights: Required<FeedRankingWeights>;
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
    maxPostsPerFeed: 25,
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

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const CLICKBAIT_PHRASES = [
  "shocking",
  "you won't believe",
  "mind-blowing",
  "secret revealed",
  "this changes everything",
];
const REPETITIVE_RUN = /(.)\1{4,}/;
const URL_RX = /https?:\/\/\S+/g;
const HASHTAG_RX = /#\w+/g;

/**
 * Pure scoring entry point. Doesn't allocate per-post explanation
 * strings, doesn't sort the input in place, doesn't introduce randomness.
 */
export function rankFeedPosts(
  posts: Post[],
  currentUser: User,
  userInteractions: UserInteraction[] = [],
  configOverride?: Partial<FeedRankingConfig>
): Post[] {
  if (!posts.length) return [];

  const config = mergeConfig(configOverride);
  const profile: UserProfile = {
    userId: currentUser._id,
    interests: [],
    followedAccounts: currentUser.following ?? [],
    blockedAccounts: [],
    interactionHistory: userInteractions,
    preferences: {
      contentTypes: ["text", "image", "video"],
      topics: [],
      mutedAccounts: [],
    },
  };

  const filtered = filterPosts(posts, profile, config);
  const scored = filtered.map((post) => ({ post, score: scorePost(post, profile, currentUser, config) }));
  scored.sort((a, b) => b.score - a.score);

  // Cap per-author so a single chatty user doesn't dominate the feed.
  const seenAuthors = new Map<string, number>();
  const limited: PostScore[] = [];
  for (const item of scored) {
    const authorId = item.post.user._id;
    const count = seenAuthors.get(authorId) ?? 0;
    if (count >= config.limits.maxPostsPerAccount) continue;
    limited.push(item);
    seenAuthors.set(authorId, count + 1);
    if (limited.length >= config.limits.maxPostsPerFeed) break;
  }

  // Optional ad insertion — only fires when the caller passes ads in.
  if (!config.adPosts?.length) return limited.map((s) => s.post);
  return insertAds(limited.map((s) => s.post), config);
}

/**
 * Lighter ranker: recency-weighted engagement velocity. Used as the
 * fallback path when the advanced ranker throws or when the caller
 * explicitly asks for it.
 */
export function simpleRankPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => velocity(b) - velocity(a));
}

interface PostScore {
  post: Post;
  score: number;
}

function mergeConfig(override?: Partial<FeedRankingConfig>): FeedRankingConfig {
  return {
    ...DEFAULT_CONFIG,
    ...override,
    weights: { ...DEFAULT_CONFIG.weights, ...(override?.weights ?? {}) },
    limits: { ...DEFAULT_CONFIG.limits, ...(override?.limits ?? {}) },
    timeDecay: { ...DEFAULT_CONFIG.timeDecay, ...(override?.timeDecay ?? {}) },
    trendingThreshold: {
      ...(DEFAULT_CONFIG.trendingThreshold ?? { minEngagement: 10, maxAgeHours: 1 }),
      ...(override?.trendingThreshold ?? {}),
    },
  };
}

function filterPosts(posts: Post[], profile: UserProfile, config: FeedRankingConfig): Post[] {
  const maxAgeMs = config.timeDecay.maxAgeHours * HOUR_MS;
  const muted = new Set([...profile.preferences.mutedAccounts, ...profile.blockedAccounts]);
  const now = Date.now();

  return posts.filter((post) => {
    if (muted.has(post.user._id)) return false;
    if (now - new Date(post.createdAt).getTime() > maxAgeMs) return false;
    if (isLowQuality(post)) return false;
    return true;
  });
}

function isLowQuality(post: Post): boolean {
  const c = post.content ?? "";
  if (c.length < 5) return true;

  const hashtags = c.match(HASHTAG_RX) ?? [];
  if (hashtags.length > 8) return true;

  const upperRatio = c.replace(/[^A-Z]/g, "").length / Math.max(c.length, 1);
  if (upperRatio > 0.7 && c.length > 20) return true;

  if (REPETITIVE_RUN.test(c)) return true;
  if ((c.match(/[!?.]{3,}/g) ?? []).length > 2) return true;
  if ((c.match(URL_RX) ?? []).length > 3) return true;
  return false;
}

function scorePost(
  post: Post,
  profile: UserProfile,
  currentUser: User,
  config: FeedRankingConfig
): number {
  const w = config.weights;
  return (
    w.engagementLikelihood * engagementLikelihood(post, profile) +
    w.recency * recencyScore(post, config) +
    w.connectionStrength * connectionStrength(post, profile, currentUser) +
    w.diversity * diversityBoost(post, profile) +
    w.quality * qualityScore(post)
  );
}

function engagementLikelihood(post: Post, profile: UserProfile): number {
  let score = 0;

  if (profile.interests.length > 0) {
    const interestSet = new Set(profile.interests.map((i) => i.toLowerCase()));
    const words = (post.content ?? "").toLowerCase().split(/\s+/);
    let matches = 0;
    for (const w of words) if (w.length > 3 && interestSet.has(w)) matches++;
    const ratio = matches / interestSet.size;
    score += Math.min(ratio * 0.4, 0.4);
  }

  const authorInteractions = profile.interactionHistory.filter((i) => i.userId === post.user._id).length;
  const totalInteractions = Math.max(profile.interactionHistory.length, 1);
  const rate = authorInteractions / totalInteractions;
  score += Math.min(rate * 0.3, 0.3);

  score += Math.min(velocity(post) * 0.1, 0.2);
  return Math.min(score, 1);
}

function recencyScore(post: Post, config: FeedRankingConfig): number {
  const ageHours = (Date.now() - new Date(post.createdAt).getTime()) / HOUR_MS;
  let decay = 1 / (1 + ageHours / config.timeDecay.halfLifeHours);
  if (ageHours > config.timeDecay.maxAgeHours) decay *= 0.5;

  const trending = config.trendingThreshold;
  const engagement = (post.likes?.length ?? 0) + (post.comments?.length ?? 0);
  if (trending && ageHours < trending.maxAgeHours && engagement > trending.minEngagement) {
    decay = Math.min(decay + 0.2, 1);
  }
  return decay;
}

function connectionStrength(post: Post, profile: UserProfile, currentUser: User): number {
  let score = 0;
  if (profile.followedAccounts.includes(post.user._id)) score += 0.5;
  if (post.user.followers?.includes(currentUser._id)) score += 0.2;

  const interactions = profile.interactionHistory.filter((i) => i.userId === post.user._id).length;
  const rate = interactions / Math.max(profile.interactionHistory.length, 1);
  score += Math.min(rate * 0.3, 0.3);
  return Math.min(score, 1);
}

function diversityBoost(post: Post, profile: UserProfile): number {
  let score = 0;
  const recent = profile.interactionHistory.filter((i) => Date.now() - i.timestamp < DAY_MS);
  const recentAuthors = new Set(recent.map((i) => i.userId));
  if (!recentAuthors.has(post.user._id)) score += 0.3;

  const type: "text" | "image" | "video" = post.image ? "image" : "text";
  if (!profile.preferences.contentTypes.includes(type)) score += 0.2;
  return Math.min(score, 1);
}

function qualityScore(post: Post): number {
  let score = 0.5;
  if (post.user.verified) score += 0.2;

  const len = (post.content ?? "").length;
  if (len > 50 && len < 500) score += 0.1;
  else if (len < 10) score -= 0.2;
  else if (len > 1000) score -= 0.1;

  const tags = (post.content ?? "").match(HASHTAG_RX) ?? [];
  if (tags.length > 0 && tags.length <= 3) score += 0.1;
  else if (tags.length > 5) score -= 0.2;

  const lower = (post.content ?? "").toLowerCase();
  if (CLICKBAIT_PHRASES.some((p) => lower.includes(p))) score -= 0.3;
  return Math.max(0, Math.min(score, 1));
}

function velocity(post: Post): number {
  const ageHours = (Date.now() - new Date(post.createdAt).getTime()) / HOUR_MS;
  const engagement = (post.likes?.length ?? 0) + (post.comments?.length ?? 0);
  return engagement / (ageHours + 1);
}

function insertAds(organic: Post[], config: FeedRankingConfig): Post[] {
  const ads = config.adPosts ?? [];
  if (!ads.length) return organic;

  const out: Post[] = [];
  let adIndex = 0;
  organic.forEach((post, i) => {
    if ((i + 1) % config.limits.adFrequency === 0 && adIndex < ads.length) {
      const ad = ads[adIndex++];
      if (ad) out.push(ad);
    }
    out.push(post);
  });
  while (adIndex < ads.length && out.length < config.limits.maxPostsPerFeed) {
    const ad = ads[adIndex++];
    if (ad) out.push(ad);
  }
  return out.slice(0, config.limits.maxPostsPerFeed);
}
