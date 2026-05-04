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
  /** User ids that have liked this comment. */
  likes?: string[];
}

export interface Post {
  _id: string;
  content: string;
  image?: string;
  createdAt: string;
  user: User;
  likes: string[];
  /**
   * Full comment list. Present on detail/comments-modal payloads but the
   * paginated feed endpoint omits it (it ships `commentCount` instead so
   * each feed page stays small).
   */
  comments?: Comment[];
  /** Server-side count, used by the feed list when `comments` is absent. */
  commentCount?: number;
}

export type NotificationType = "like" | "comment" | "follow";

export interface Notification {
  _id: string;
  from: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    verified?: boolean;
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

// ─────────────────────────────────────────────────────────────────────────
// Chat — added for the new realtime chat (option A: polling on Mongo).
// ─────────────────────────────────────────────────────────────────────────

/**
 * Slim user shape returned alongside every conversation so the inbox can
 * render avatar + name without a second round trip.
 */
export interface ChatUser {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  verified?: boolean;
}

export interface ChatMessage {
  _id: string;
  conversation: string;
  sender: string;
  body: string;
  createdAt: string;
  /** User ids that have read this message. */
  readBy?: string[];
  /** Idempotency key the sender used. Lets the client reconcile optimistic rows. */
  clientId?: string;
  /** Client-only flag set on optimistic rows; never sent by the server. */
  pending?: boolean;
  /** Client-only flag — true when an optimistic send fails permanently. */
  failed?: boolean;
}

export interface Conversation {
  _id: string;
  participants: ChatUser[];
  lastMessage?: ChatMessage | null;
  lastActivityAt: string;
  /** Server-computed unread count for the current user. */
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}
