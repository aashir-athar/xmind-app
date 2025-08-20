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

export const userApi = {
  syncUser: (api: AxiosInstance) => api.post("/users/sync"),
  getCurrentUser: (api: AxiosInstance) => api.get("/users/me"),
  updateProfile: (api: AxiosInstance, data: any) =>
    api.post("/users/profile", data),
  updateUsername: (api: AxiosInstance, username: string) =>
    api.put("/users/username", { username }),
  checkUsernameAvailability: (api: AxiosInstance, username: string) =>
    api.get(`/users/check-username/${username}`),
  getUserProfile: (api: AxiosInstance, username: string) =>
    api.get(`/users/profile/${username}`),
  followUser: (api: AxiosInstance, targetUserId: string) =>
    api.post(`/users/follow/${targetUserId}`),
  toggleVerification: (api: AxiosInstance, targetUserId: string) =>
    api.post(`/users/verify/${targetUserId}`),
};



export const postApi = {
  createPost: (api: AxiosInstance, data: { content: string; image?: string }) =>
    api.post("/posts", data),
  getPosts: (api: AxiosInstance) => api.get("/posts"),
  getUserPosts: (api: AxiosInstance, username: string) =>
    api.get(`/posts/user/${username}`),
  likePost: (api: AxiosInstance, postId: string) =>
    api.post(`/posts/${postId}/like`),
  deletePost: (api: AxiosInstance, postId: string) =>
    api.delete(`/posts/${postId}`),
};

export const commentApi = {
  createComment: (api: AxiosInstance, postId: string, content: string) =>
    api.post(`/comments/post/${postId}`, { content }),
  deleteComment: (api: AxiosInstance, commentId: string) =>
    api.delete(`/comments/${commentId}`),
};
