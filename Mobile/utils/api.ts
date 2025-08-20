import axios, { AxiosInstance } from "axios";
import { useAuth } from "@clerk/clerk-expo";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://x-clone-react-native-seven.vercel.app/api";
// ! 🔥 localhost api would not work on your actual physical device
// const API_BASE_URL = "http://localhost:5001/api";

// this will basically create an authenticated api, pass the token into our headers
export const createApiClient = (
  getToken: () => Promise<string | null>
): AxiosInstance => {
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "User-Agent": "xMind/1.0 (Mobile App)",
      Accept: "application/json",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  // In api.ts, update the request interceptor
  api.interceptors.request.use(async (config) => {
    try {
      const token = await getToken();
      console.log(
        `Request to ${config.url}: Token ${token ? "present" : "missing"}`
      );

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn(`No token available for ${config.url}`);
      }
    } catch (error) {
      console.error("Error getting token:", error);
    }
    return config;
  });

  // Update response interceptor
  api.interceptors.response.use(
    (response) => {
      console.log("API Response:", {
        status: response.status,
        url: response.config.url,
      });
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        console.log("401 detected, waiting and retrying...");

        // Wait a moment for session to stabilize
        await new Promise((resolve) => setTimeout(resolve, 1000));

        try {
          const newToken = await getToken();
          if (newToken) {
            console.log("New token obtained, retrying request");
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } else {
            console.log("Still no token available after retry");
          }
        } catch (tokenError) {
          console.error("Error getting new token:", tokenError);
        }
      }

      if (
        error.response?.status === 403 &&
        error.response?.data?.error === "Bot access denied"
      ) {
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return api(originalRequest);
        }
      }

      console.error("API Error:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        url: error.config?.url,
      });
      return Promise.reject(error);
    }
  );

  return api;
};

export const useApiClient = (): AxiosInstance => {
  const { getToken } = useAuth();
  return createApiClient(getToken);
};

// User API functions for profile management
export const userApi = {
  // Get current user
  getCurrentUser: (api: any) => api.get("/users/me"),

  // Get user profile by username
  getUserProfile: (api: any, username: string) =>
    api.get(`/users/profile/${username}`),

  // Update profile with images (same structure as posts)
  updateProfile: (api: any, profileData: FormData) =>
    api.post("/users/profile", profileData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Update username separately
  updateUsername: (api: any, username: string) =>
    api.put("/users/username", { username }),

  // Check username availability
  checkUsernameAvailability: (api: any, username: string) =>
    api.get(`/users/check-username/${username}`),

  // Follow/unfollow user
  followUser: (api: any, targetUserId: string) =>
    api.post(`/users/follow/${targetUserId}`),

  // Auto-verification
  autoVerifyUser: (api: any) => api.post("/users/verify"),

  // Toggle verification (admin)
  toggleVerification: (api: any, targetUserId: string) =>
    api.post(`/users/verify/${targetUserId}`),

  // Sync user data
  syncUser: (api: any) => api.post("/users/sync"),
};

// Post API functions (if not already present)
export const postApi = {
  // Get all posts
  getPosts: (api: any) => api.get("/posts"),

  // Get post by ID
  getPost: (api: any, postId: string) => api.get(`/posts/${postId}`),

  // Get user posts
  getUserPosts: (api: any, username: string) =>
    api.get(`/posts/user/${username}`),

  // Create post with image (same structure as profile update)
  createPost: (api: any, postData: FormData) =>
    api.post("/posts", postData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Like/unlike post
  likePost: (api: any, postId: string) => api.post(`/posts/${postId}/like`),

  // Delete post
  deletePost: (api: any, postId: string) => api.delete(`/posts/${postId}`),
};

// Comment API functions (if not already present)
export const commentApi = {
  // Create comment
  createComment: (api: any, postId: string, content: string) =>
    api.post("/comments", { postId, content }),

  // Delete comment
  deleteComment: (api: any, commentId: string) =>
    api.delete(`/comments/${commentId}`),

  // Get comments for post
  getComments: (api: any, postId: string) =>
    api.get(`/comments/post/${postId}`),
};

// Notification API functions (if not already present)
export const notificationApi = {
  // Get user notifications
  getNotifications: (api: any) => api.get("/notifications"),

  // Mark notification as read
  markAsRead: (api: any, notificationId: string) =>
    api.put(`/notifications/${notificationId}/read`),

  // Mark all notifications as read
  markAllAsRead: (api: any) => api.put("/notifications/read-all"),

  // Delete notification
  deleteNotification: (api: any, notificationId: string) =>
    api.delete(`/notifications/${notificationId}`),
};
