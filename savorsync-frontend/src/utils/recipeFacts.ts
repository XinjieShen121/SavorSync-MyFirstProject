// Recipe facts read only from the recipe's own data (design.md 4.3: never estimate).

export interface RecipeFactsSource {
  prep_time?: string;
  cook_time?: string;
  prepTime?: string;
  cookTime?: string;
  total_time?: string;
  totalTime?: string;
  servings?: number | string | null;
  difficulty?: string;
  tags?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
}

// "1 hour 30 minutes", "45 min", "2 hrs", "1.5 hours", "PT20M" -> minutes, or null
export const parseMinutes = (value?: string | number | null): number | null => {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'number') return value > 0 ? Math.round(value) : null;
  const text = value.toLowerCase();

  const iso = text.match(/^pt(?:(\d+)h)?(?:(\d+)m)?$/);
  if (iso) return (Number(iso[1] || 0) * 60 + Number(iso[2] || 0)) || null;

  let minutes = 0;
  let found = false;
  const hours = text.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/);
  if (hours) { minutes += parseFloat(hours[1]) * 60; found = true; }
  const mins = text.match(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)\b/);
  if (mins) { minutes += parseFloat(mins[1]); found = true; }
  if (!found && /^\d+$/.test(text.trim())) { minutes = Number(text.trim()); found = true; }

  return found && minutes > 0 ? Math.round(minutes) : null;
};

export const totalMinutes = (recipe: RecipeFactsSource): number | null => {
  const total = parseMinutes(recipe.total_time || recipe.totalTime);
  if (total) return total;
  const prep = parseMinutes(recipe.prep_time || recipe.prepTime);
  const cook = parseMinutes(recipe.cook_time || recipe.cookTime);
  if (prep === null && cook === null) return null;
  return (prep || 0) + (cook || 0);
};

export const formatMinutes = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
};

export type Diet = 'vegetarian' | 'vegan' | 'gluten-free';

export const DIET_LABELS: Record<Diet, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  'gluten-free': 'Gluten-free',
};

const hasTag = (recipe: RecipeFactsSource, pattern: RegExp) =>
  (recipe.tags || []).some(tag => pattern.test(tag));

// Diets the recipe is marked with, from its flags or tags
export const recipeDiets = (recipe: RecipeFactsSource): Diet[] => {
  const diets: Diet[] = [];
  const vegan = recipe.isVegan || hasTag(recipe, /^vegan$/i);
  if (vegan || recipe.isVegetarian || hasTag(recipe, /^vegetarian$/i)) diets.push('vegetarian');
  if (vegan) diets.push('vegan');
  if (recipe.isGlutenFree || hasTag(recipe, /^gluten[- ]?free$/i)) diets.push('gluten-free');
  return diets;
};

export const normalizeDifficulty = (value?: string): string | null => {
  if (!value) return null;
  const lower = value.trim().toLowerCase();
  if (lower.startsWith('easy') || lower === 'beginner') return 'Easy';
  if (lower.startsWith('med') || lower === 'intermediate') return 'Medium';
  if (lower.startsWith('hard') || lower === 'advanced' || lower === 'difficult') return 'Hard';
  return null;
};

// Time buckets for the filter bar
export type TimeBucket = 'under-30' | '30-60' | 'over-60';

export const TIME_LABELS: Record<TimeBucket, string> = {
  'under-30': 'Under 30 min',
  '30-60': '30 to 60 min',
  'over-60': 'Over an hour',
};

export const timeBucket = (recipe: RecipeFactsSource): TimeBucket | null => {
  const minutes = totalMinutes(recipe);
  if (minutes === null) return null;
  if (minutes < 30) return 'under-30';
  if (minutes <= 60) return '30-60';
  return 'over-60';
};
