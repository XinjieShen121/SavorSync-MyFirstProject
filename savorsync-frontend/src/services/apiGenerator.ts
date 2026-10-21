import axios from 'axios';
import recipeAPI from './apiRecipe';
import type { RecipeCardRecipe } from '../components/RecipeCard';

export interface GeneratedRecipe extends RecipeCardRecipe {
  subtitle?: string;
  culturalBackground?: string;
  fun_facts?: string[];
  ingredients: string[];
  instructions: string[];
  servings?: number | null;
  draft?: boolean;
}

export interface GenerateRequest {
  ingredients: string[];
  cuisine?: string;
  diet?: string;
  maxMinutes?: number;
}

const friendlyError = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      return new Error('Please sign in again to cook with AI.');
    }
    const message = (err.response?.data as { message?: string } | undefined)?.message;
    if (message) return new Error(message);
  }
  return new Error(fallback);
};

// "Cook with what I have": the API writes a recipe and keeps it as a private draft
export const generateRecipe = async (request: GenerateRequest): Promise<GeneratedRecipe> => {
  try {
    const res = await recipeAPI.post('/generate', request, { timeout: 60000 });
    return res.data.recipe;
  } catch (err) {
    throw friendlyError(err, "Couldn't create a recipe right now. Please try again.");
  }
};

export const saveGeneratedRecipe = async (recipeId: string): Promise<GeneratedRecipe> => {
  try {
    const res = await recipeAPI.post(`/generated/${recipeId}/save`);
    return res.data.recipe;
  } catch (err) {
    throw friendlyError(err, "Couldn't save this recipe. Please try again.");
  }
};

export const getMyRecipes = async (): Promise<GeneratedRecipe[]> => {
  try {
    const res = await recipeAPI.get('/mine');
    return res.data.recipes;
  } catch (err) {
    throw friendlyError(err, "Couldn't load your recipes. Please try again.");
  }
};
