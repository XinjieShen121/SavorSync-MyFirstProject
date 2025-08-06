import axios from 'axios';

const userAPI = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

userAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor to handle errors
userAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Register new user
  register: async (name: string, email: string, password: string) => {
    try {
      const response = await userAPI.post('/auth/register', {
        name,
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        // Handle validation errors with detailed messages
        const validationErrors = error.response.data.details;
        if (validationErrors && Array.isArray(validationErrors)) {
          const errorMessages = validationErrors.map((err: any) => err.msg).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(error.response.data.error || 'Validation failed');
      }
      if (error.response?.status === 409) {
        throw new Error('User with this email already exists');
      }
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  },

  // Login user
  login: async (email: string, password: string) => {
    try {
      const response = await userAPI.post('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        // Handle validation errors with detailed messages
        const validationErrors = error.response.data.details;
        if (validationErrors && Array.isArray(validationErrors)) {
          const errorMessages = validationErrors.map((err: any) => err.msg).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(error.response.data.error || 'Validation failed');
      }
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },
};

// User API functions
export const userProfileAPI = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await userAPI.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('User not found');
      }
      throw new Error(error.response?.data?.error || 'Failed to fetch profile');
    }
  },

  // Update user profile
  updateProfile: async (updates: { name?: string; avatar?: string }) => {
    try {
      const response = await userAPI.put('/auth/profile', updates);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('User not found');
      }
      throw new Error(error.response?.data?.error || 'Failed to update profile');
    }
  },

  // Add recipe to favorites
  addToFavorites: async (recipeName: string) => {
    try {
      const response = await userAPI.post('/user/favorites', { recipeName });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        throw new Error('Recipe name is required');
      }
      if (error.response?.status === 404) {
        throw new Error('User not found');
      }
      throw new Error(error.response?.data?.error || 'Failed to add to favorites');
    }
  },

  // Save recipe
  saveRecipe: async (recipeName: string) => {
    try {
      const response = await userAPI.post('/user/saved-recipes', { recipeName });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        throw new Error('Recipe name is required');
      }
      if (error.response?.status === 404) {
        throw new Error('User not found');
      }
      throw new Error(error.response?.data?.error || 'Failed to save recipe');
    }
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    try {
      const response = await userAPI.get('/health');
      return response.data;
    } catch (error: any) {
      throw new Error('API is not available');
    }
  },
};

export default userAPI; 