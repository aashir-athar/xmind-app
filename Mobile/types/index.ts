export interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
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

export interface Notification {
  _id: string;
  from: {
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  to: string;
  type: "like" | "comment" | "follow";
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

// Main exports
export { default } from "../components/CustomTabBar";
export { default as CustomTabBar } from "../components/CustomTabBar";

// Component exports for advanced customization
export { TabIcon } from "../components/TabIcon";
export { TabBackground } from "../components/TabBackground";
export { AnimatedTabContainer } from "../components/AnimatedTabContainer";

// Types (if you want to extend them)
export interface TabRoute {
  name: string;
  key: string;
}

export interface TabIconConfig {
  iconName: string;
  gradientColors: [string, string];
}

export interface CustomTabBarConfig {
  routes: TabRoute[];
  tabWidth?: number;
  animationDuration?: number;
  springConfig?: {
    damping: number;
    stiffness: number;
  };
}
