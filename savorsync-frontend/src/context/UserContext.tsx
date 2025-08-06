import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, userProfileAPI } from '../services/apiUser';
import { userSocialAPI } from '../services/apiCommunity';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  favorites: string[];
  savedRecipes: string[];
  reviews: number;
  followers: string[];
  following: string[];
  createdAt?: string;
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  addToFavorites: (recipeName: string) => Promise<void>;
  saveRecipe: (recipeName: string) => Promise<void>;
  // Social features
  toggleFollow: (userId: string) => Promise<void>;
  getUserProfile: (userId: string) => Promise<User>;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token and user data on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        console.log('UserContext: Initializing auth...');
        console.log('UserContext: Token exists:', !!token);
        console.log('UserContext: Saved user exists:', !!savedUser);
        
        if (token && savedUser) {
          // Verify token is still valid by fetching user profile
          console.log('UserContext: Attempting to validate token...');
          const response = await userProfileAPI.getProfile();
          console.log('UserContext: Token validation successful:', response.user);
          setUser(response.user);
        } else {
          console.log('UserContext: No token or user data found');
        }
      } catch (error) {
        console.error('UserContext: Token validation failed:', error);
        // Token is invalid, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
        console.log('UserContext: Auth initialization complete');
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      // Re-throw the error so the LoginPage can display the specific message
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('UserContext: Starting registration for:', email);
      
      const response = await authAPI.register(name, email, password);
      console.log('UserContext: Registration API response:', response);
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      console.log('UserContext: Registration successful, user set');
      return true;
    } catch (error) {
      console.error('UserContext: Registration error:', error);
      // Re-throw the error so the RegisterPage can display the specific message
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>): Promise<void> => {
    try {
      setLoading(true);
      const response = await userProfileAPI.updateProfile(updates);
      
      // Update local storage and state
      const updatedUser = { ...user, ...response.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (recipeName: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await userProfileAPI.addToFavorites(recipeName);
      
      // Update local storage and state
      const updatedUser = { ...user, ...response.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Add to favorites error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const saveRecipe = async (recipeName: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await userProfileAPI.saveRecipe(recipeName);
      
      // Update local storage and state
      const updatedUser = { ...user, ...response.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Save recipe error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Social features
  const toggleFollow = async (userId: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await userSocialAPI.toggleFollow(userId);
      
      // Update local storage and state
      const updatedUser = { ...user, ...response.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Toggle follow error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserProfile = async (userId: string): Promise<User> => {
    try {
      setLoading(true);
      const response = await userSocialAPI.getUserProfile(userId);
      return response.user;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: UserContextType = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    addToFavorites,
    saveRecipe,
    toggleFollow,
    getUserProfile,
    loading
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 