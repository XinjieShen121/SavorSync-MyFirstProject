export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  cuisine: string;
  region: string;
  image: string;
  videoUrl?: string;
  videoTitle?: string;
  culturalBackground: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

export interface Cuisine {
  id: string;
  name: string;
  region: string;
  image: string;
  description: string;
  recipes: Recipe[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  favorites: string[];
} 