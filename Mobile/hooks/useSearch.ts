/**
 * Client-side search hook.
 *
 * Architectural role:
 *  Derives trending hashtags, suggested users, and a name/handle search
 *  function from the cached feed data — no extra network calls. Cheap
 *  on-device math means the search screen feels instant on every
 *  keystroke even on a 2 GB Android device.
 */
import { useMemo } from "react";

import { usePosts } from "./usePosts";
import { useCurrentUser } from "./useCurrentUser";
import type { Post, User } from "../types";

const MAX_HASHTAGS = 20;
const MAX_SUGGESTED_USERS = 8;

export const useSearch = () => {
  const { posts } = usePosts();
  const { currentUser } = useCurrentUser();

  const trendingHashtags = useMemo(() => {
    const hashtagCounts: Record<string, number> = {};
    for (const post of posts) {
      const hashtags = post.content?.match(/#\w+/g) ?? [];
      for (const hashtag of hashtags) {
        const tag = hashtag.toLowerCase();
        hashtagCounts[tag] = (hashtagCounts[tag] ?? 0) + 1;
      }
    }
    return Object.entries(hashtagCounts)
      .map(([hashtag, count]) => ({ hashtag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, MAX_HASHTAGS);
  }, [posts]);

  const uniqueUsers = useMemo(() => {
    const users = new Map<string, User>();
    for (const post of posts) {
      if (!post.user?._id) continue;
      if (post.user._id === currentUser?._id) continue;
      if (!users.has(post.user._id)) users.set(post.user._id, post.user);
    }
    return Array.from(users.values());
  }, [posts, currentUser?._id]);

  /**
   * Suggested users — verified first, then by follower count, then by
   * post count in the visible feed. Capped to keep the resting state
   * scannable in one glance (Hick's Law).
   */
  const suggestedUsers = useMemo(() => {
    const followingSet = new Set(currentUser?.following ?? []);
    const postCount = new Map<string, number>();
    for (const post of posts) {
      if (!post.user?._id) continue;
      postCount.set(post.user._id, (postCount.get(post.user._id) ?? 0) + 1);
    }
    return [...uniqueUsers]
      .filter((u) => !followingSet.has(u._id))
      .sort((a, b) => {
        const av = a.verified ? 1 : 0;
        const bv = b.verified ? 1 : 0;
        if (av !== bv) return bv - av;
        const af = a.followers?.length ?? 0;
        const bf = b.followers?.length ?? 0;
        if (af !== bf) return bf - af;
        return (postCount.get(b._id) ?? 0) - (postCount.get(a._id) ?? 0);
      })
      .slice(0, MAX_SUGGESTED_USERS);
  }, [uniqueUsers, currentUser?.following, posts]);

  const searchUsers = (searchQuery: string): User[] => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return uniqueUsers.filter((user) =>
      user.username.toLowerCase().includes(query) ||
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query)
    );
  };

  const searchPosts = (searchQuery: string): Post[] => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return posts.filter(
      (post) =>
        post.content?.toLowerCase().includes(query) ||
        post.user.username.toLowerCase().includes(query)
    );
  };

  const getPostsByHashtag = (hashtag: string): Post[] => {
    const target = hashtag.toLowerCase();
    return posts.filter((post) => {
      const hashtags = post.content?.match(/#\w+/g) ?? [];
      return hashtags.some((tag) => tag.toLowerCase() === target);
    });
  };

  // Used by `useExistingUsernames` for client-side username collision
  // checks while the user is editing their profile.
  const allUsernames = useMemo(
    () => uniqueUsers.map((u) => u.username.toLowerCase()),
    [uniqueUsers]
  );

  return {
    trendingHashtags,
    suggestedUsers,
    searchUsers,
    searchPosts,
    getPostsByHashtag,
    posts,
    allUsernames,
  };
};
