import axios from 'axios';

// Debug: Log the API base URL
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
console.log('🔧 Environment VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('🌐 Final Recipe API Base URL:', apiBaseUrl + '/recipes');

const recipeAPI = axios.create({
  baseURL: apiBaseUrl + '/recipes',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
recipeAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
recipeAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Recipe API Error:', error.response?.data || error.message);
    throw error;
  }
);

export const getAllRecipes = async () => {
  const res = await recipeAPI.get('/');
  return res.data;
};

export const getRecipeById = async (id: string) => {
  const res = await recipeAPI.get(`/${id}`);
  return res.data;
};

export const getRecipesByCuisine = async (cuisine: string) => {
  const res = await recipeAPI.get(`/cuisine/${cuisine}`);
  return res.data;
};

export const searchRecipes = async (query: string) => {
  const res = await recipeAPI.post('/search', { query });
  return res.data;
};

export const generateRecipe = async (recipe_name: string, cuisine: string) => {
  const res = await recipeAPI.post('/generate', {
    recipe_name,
    cuisine,
    save_to_database: true,
  });
  return res.data;
};

// New functions for All Recipes page
export const getAllCuisines = async () => {
  const res = await recipeAPI.get('/cuisines');
  return res.data;
};

export const getRecipesWithFilter = async (cuisine?: string, page: number = 1, limit: number = 12) => {
  const params = new URLSearchParams();
  if (cuisine && cuisine !== 'all') {
    params.append('cuisine', cuisine);
  }
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  const res = await recipeAPI.get(`/?${params.toString()}`);
  return res.data;
};

// Legacy function for backward compatibility
export const getRecipes = async () => {
  return getAllRecipes();
};

export default recipeAPI; 