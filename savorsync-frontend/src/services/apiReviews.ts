import axios from 'axios';
import { API_BASE_URL } from './config';

export interface Review {
  _id: string;
  recipeId: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  rating: number;
  text?: string;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  count: number;
  average: number | null;
}

const reviewAPI = axios.create({ baseURL: `${API_BASE_URL}/reviews` });
reviewAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const friendlyError = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      return new Error('Please sign in again to review.');
    }
    const message = (err.response?.data as { message?: string } | undefined)?.message;
    if (message) return new Error(message);
  }
  return new Error(fallback);
};

export const getReviews = async (recipeId: string): Promise<{ reviews: Review[]; summary: ReviewSummary }> => {
  try {
    const res = await reviewAPI.get(`/recipe/${recipeId}`);
    return res.data;
  } catch (err) {
    throw friendlyError(err, "Couldn't load reviews.");
  }
};

export const saveReview = async (recipeId: string, body: { rating: number; text?: string; imageUrl?: string | null }): Promise<Review> => {
  try {
    const res = await reviewAPI.post(`/recipe/${recipeId}`, body);
    return res.data.review;
  } catch (err) {
    throw friendlyError(err, "Couldn't save your review. Please try again.");
  }
};

export const deleteReview = async (recipeId: string): Promise<void> => {
  try {
    await reviewAPI.delete(`/recipe/${recipeId}`);
  } catch (err) {
    throw friendlyError(err, "Couldn't remove your review. Please try again.");
  }
};
