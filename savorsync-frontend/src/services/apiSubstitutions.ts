import axios from 'axios';
import { API_BASE_URL } from './config';

export type SwapDiet = 'vegetarian' | 'gluten-free' | 'low-sodium';

export interface IngredientSwaps {
  index: number;
  options: { diet: SwapDiet; name: string; reason?: string; matchKey: string }[];
}

// Ingredient swaps for a recipe: AI when the API has a key, a checked table otherwise
export const getSubstitutions = async (recipeId: string): Promise<{ swaps: IngredientSwaps[]; source: 'ai' | 'fallback' }> => {
  try {
    const res = await axios.get(`${API_BASE_URL}/substitutions/${recipeId}`);
    return res.data;
  } catch (err) {
    const message = axios.isAxiosError(err) ? (err.response?.data as { message?: string } | undefined)?.message : undefined;
    throw new Error(message || "Couldn't load swaps right now.");
  }
};
