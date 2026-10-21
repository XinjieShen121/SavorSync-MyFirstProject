import axios from 'axios';
import recipeAPI from './apiRecipe';

// Favorites are stored on the signed-in user's account (design.md 4.3 heart)

const friendlyError = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      return new Error('Please sign in again to save recipes.');
    }
    const message = (err.response?.data as { error?: string } | undefined)?.error;
    if (message) return new Error(message);
  }
  return new Error(fallback);
};

export const addFavorite = async (recipeId: string): Promise<string[]> => {
  try {
    const res = await recipeAPI.post(`/${recipeId}/favorite`);
    return res.data.favorites;
  } catch (err) {
    throw friendlyError(err, "Couldn't save this recipe. Please try again.");
  }
};

export const removeFavorite = async (recipeId: string): Promise<string[]> => {
  try {
    const res = await recipeAPI.delete(`/${recipeId}/favorite`);
    return res.data.favorites;
  } catch (err) {
    throw friendlyError(err, "Couldn't remove this recipe. Please try again.");
  }
};

export const getFavoriteRecipes = async () => {
  try {
    const res = await recipeAPI.get('/favorites');
    return res.data.recipes;
  } catch (err) {
    throw friendlyError(err, "Couldn't load your favorites. Please try again.");
  }
};
