/**
 * Public domain types shared across screens, hooks, and components.
 * The shape mirrors the backend response so frontend code never has to
 * reach for `any` to traverse a payload.
 */

export interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  verified?: boolean;
  followers?: string[];
  following?: string[];
  bio?: string;
  location?: string;
  bannerImage?: string;
  createdAt?: string;
}

export interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  user: User;
}

export interface Post {
  _id: string;
  content: string;
  image?: string;
  createdAt: string;
  user: User;
  likes: string[];
  comments: Comment[];
}

export type NotificationType = "like" | "comment" | "follow";

export interface Notification {
  _id: string;
  from: {
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  to: string;
  type: NotificationType;
  post?: {
    _id: string;
    content: string;
    image?: string;
  };
  comment?: {
    _id: string;
    content: string;
  };
  createdAt: string;
}

/** Re-export the active tab bar for any consumer that wants the symbol. */
export { default as PillTabBar } from "../components/PillTabBar";
