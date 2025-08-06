import axios from 'axios';

const communityAPI = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add request interceptor for authentication
communityAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
communityAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Community API Error:', error.response?.data || error.message);
    throw error;
  }
);

// Post/Recipe Social Features
export const postAPI = {
  // Get all posts/recipes with social data
  getAllPosts: async () => {
    const res = await communityAPI.get('/posts');
    return res.data;
  },

  // Get single post by ID
  getPostById: async (id: string) => {
    const res = await communityAPI.get(`/posts/${id}`);
    return res.data;
  },

  // Create new post/recipe
  createPost: async (postData: {
    title: string;
    content: string;
    image?: string;
    cuisine?: string;
    type: 'recipe' | 'story';
  }) => {
    const res = await communityAPI.post('/posts', postData);
    return res.data;
  },

  // Like/Unlike a post
  toggleLike: async (postId: string) => {
    const res = await communityAPI.post(`/posts/${postId}/like`);
    return res.data;
  },

  // Get likes for a post
  getLikes: async (postId: string) => {
    const res = await communityAPI.get(`/posts/${postId}/likes`);
    return res.data;
  },
};

// User Social Features
export const userSocialAPI = {
  // Get user profile by ID
  getUserProfile: async (userId: string) => {
    const res = await communityAPI.get(`/users/${userId}`);
    return res.data;
  },

  // Follow/Unfollow user
  toggleFollow: async (userId: string) => {
    const res = await communityAPI.put(`/users/${userId}/follow`);
    return res.data;
  },

  // Get user's followers
  getFollowers: async (userId: string) => {
    const res = await communityAPI.get(`/users/${userId}/followers`);
    return res.data;
  },

  // Get user's following
  getFollowing: async (userId: string) => {
    const res = await communityAPI.get(`/users/${userId}/following`);
    return res.data;
  },

  // Get user's friends (mutual follows)
  getFriends: async (userId: string) => {
    const res = await communityAPI.get(`/users/${userId}/friends`);
    return res.data;
  },

  // Get user's posts
  getUserPosts: async (userId: string) => {
    const res = await communityAPI.get(`/users/${userId}/posts`);
    return res.data;
  },

  // Update user profile
  updateProfile: async (updates: {
    name?: string;
    avatar?: string;
    bio?: string;
  }) => {
    const res = await communityAPI.put('/users/profile', updates);
    return res.data;
  },
};

// Community Features
export const communityFeaturesAPI = {
  // Get community feed
  getFeed: async () => {
    const res = await communityAPI.get('/community/feed');
    return res.data;
  },

  // Get trending posts
  getTrendingPosts: async () => {
    const res = await communityAPI.get('/community/trending');
    return res.data;
  },

  // Search users
  searchUsers: async (query: string) => {
    const res = await communityAPI.get(`/community/search?q=${query}`);
    return res.data;
  },
};

export default communityAPI; 