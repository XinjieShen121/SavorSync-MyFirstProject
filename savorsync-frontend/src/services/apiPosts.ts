import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance with default config
const postsAPI = axios.create({
  baseURL: `${API_BASE_URL}/posts`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
postsAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
postsAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Post interface
export interface Post {
  _id?: string;
  title: string;
  content: string;
  image?: string;
  tags: string[];
  category: string;
  author: string;
  authorId?: string;
  createdAt?: string;
  updatedAt?: string;
  likes?: number;
  comments?: any[];
}

// Create a new post
export const createPost = async (postData: Post) => {
  try {
    const response = await postsAPI.post('/', postData);
    return response;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Get all posts with optional filtering
export const getAllPosts = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  author?: string;
  search?: string;
}) => {
  try {
    const response = await postsAPI.get('/', { params });
    return response;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Get a single post by ID
export const getPost = async (postId: string) => {
  try {
    const response = await postsAPI.get(`/${postId}`);
    return response;
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
};

// Update a post
export const updatePost = async (postId: string, postData: Partial<Post>) => {
  try {
    const response = await postsAPI.put(`/${postId}`, postData);
    return response;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

// Delete a post
export const deletePost = async (postId: string) => {
  try {
    console.log('API: Deleting post with ID:', postId);
    console.log('API: Auth token:', localStorage.getItem('token') ? 'Present' : 'Missing');
    
    const response = await postsAPI.delete(`/${postId}`);
    console.log('API: Delete response:', response);
    return response;
  } catch (error: any) {
    console.error('API: Error deleting post:', error);
    console.error('API: Error status:', error.response?.status);
    console.error('API: Error data:', error.response?.data);
    console.error('API: Error message:', error.message);
    throw error;
  }
};

// Like a post
export const likePost = async (postId: string) => {
  try {
    const response = await postsAPI.post(`/${postId}/like`);
    return response;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

// Unlike a post
export const unlikePost = async (postId: string) => {
  try {
    const response = await postsAPI.delete(`/${postId}/like`);
    return response;
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
};

// Add a comment to a post
export const addComment = async (postId: string, commentData: { content: string }) => {
  try {
    const response = await postsAPI.post(`/${postId}/comments`, commentData);
    return response;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Get comments for a post
export const getComments = async (postId: string) => {
  try {
    const response = await postsAPI.get(`/${postId}/comments`);
    return response;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (postId: string, commentId: string) => {
  try {
    const response = await postsAPI.delete(`/${postId}/comments/${commentId}`);
    return response;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// Get posts by user
export const getUserPosts = async (userId: string, params?: {
  page?: number;
  limit?: number;
}) => {
  try {
    const response = await postsAPI.get(`/user/${userId}`, { params });
    return response;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};

// Search posts
export const searchPosts = async (query: string, params?: {
  page?: number;
  limit?: number;
  category?: string;
}) => {
  try {
    const response = await postsAPI.get('/search', {
      params: { q: query, ...params }
    });
    return response;
  } catch (error) {
    console.error('Error searching posts:', error);
    throw error;
  }
};

// Get trending posts
export const getTrendingPosts = async (params?: {
  limit?: number;
  timeframe?: 'day' | 'week' | 'month';
}) => {
  try {
    const response = await postsAPI.get('/trending', { params });
    return response;
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    throw error;
  }
};

export default postsAPI; 