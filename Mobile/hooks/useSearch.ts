import { useMemo } from "react";
import { usePosts } from "./usePosts";
import { useCurrentUser } from "./useCurrentUser";
import { Post, User } from "../types";

export const useSearch = () => {
  const { posts } = usePosts();
  const { currentUser } = useCurrentUser();

  // Extract hashtags from all posts and count their occurrences
  const trendingHashtags = useMemo(() => {
    const hashtagCounts: { [key: string]: number } = {};
    
    posts.forEach((post: Post) => {
      const hashtags = post.content.match(/#\w+/g) || [];
      hashtags.forEach((hashtag) => {
        hashtagCounts[hashtag] = (hashtagCounts[hashtag] || 0) + 1;
      });
    });

    // Convert to array and sort by count
    return Object.entries(hashtagCounts)
      .map(([hashtag, count]) => ({ hashtag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 trending hashtags
  }, [posts]);

  // Search users by username, firstName, or lastName
  const searchUsers = (searchQuery: string): User[] => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase().trim();
    
    // Get unique users from posts
    const uniqueUsers = new Map<string, User>();
    posts.forEach((post: Post) => {
      if (!uniqueUsers.has(post.user._id)) {
        uniqueUsers.set(post.user._id, post.user);
      }
    });

    // Filter users based on search query
    return Array.from(uniqueUsers.values()).filter((user: User) => {
      return (
        user.username.toLowerCase().includes(query) ||
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query)
      );
    });
  };

  // Get posts by hashtag
  const getPostsByHashtag = (hashtag: string): Post[] => {
    return posts.filter((post: Post) => {
      const hashtags = post.content.match(/#\w+/g) || [];
      return hashtags.some(tag => tag.toLowerCase() === hashtag.toLowerCase());
    });
  };

  return {
    trendingHashtags,
    searchUsers,
    getPostsByHashtag,
    posts,
  };
};
