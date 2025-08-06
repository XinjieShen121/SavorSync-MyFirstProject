import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const culturalAPI = axios.create({
  baseURL: `${API_BASE_URL}/cultural`,
  timeout: 30000, // 30 seconds timeout for OpenAI requests
});

// Add request interceptor for logging
culturalAPI.interceptors.request.use(
  (config) => {
    console.log('🧠 Cultural API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('🧠 Cultural API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
culturalAPI.interceptors.response.use(
  (response) => {
    console.log('🧠 Cultural API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('🧠 Cultural API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface CulturalInsightResponse {
  success: boolean;
  recipe: {
    id?: string;
    name: string;
    cuisine: string;
  };
  insight: string;
  generatedAt: string;
}

export interface CulturalErrorResponse {
  error: string;
  message: string;
  details?: string;
}

/**
 * Get cultural insights for a specific recipe by ID
 */
export const getCulturalInsight = async (recipeId: string): Promise<CulturalInsightResponse> => {
  try {
    console.log('🔍 Requesting cultural insight for recipe:', recipeId);
    
    const response = await culturalAPI.get(`/insight/${recipeId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error getting cultural insight:', error);
    
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to get cultural insight');
    }
    
    throw new Error('Network error: Unable to connect to cultural insights service');
  }
};

/**
 * Get cultural insights for a custom recipe (without saving to database)
 */
export const getCulturalInsightForCustomRecipe = async (
  recipeName: string, 
  cuisine: string, 
  ingredients?: string[]
): Promise<CulturalInsightResponse> => {
  try {
    console.log('🔍 Requesting cultural insight for custom recipe:', recipeName);
    
    const response = await culturalAPI.post('/insight', {
      recipeName,
      cuisine,
      ingredients
    });
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error getting cultural insight for custom recipe:', error);
    
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to get cultural insight');
    }
    
    throw new Error('Network error: Unable to connect to cultural insights service');
  }
};

/**
 * Check if cultural insights service is available
 */
export const checkCulturalServiceHealth = async (): Promise<boolean> => {
  try {
    const response = await culturalAPI.get('/health');
    return response.data.status === 'OK';
  } catch (error) {
    console.error('❌ Cultural service health check failed:', error);
    return false;
  }
};

export default culturalAPI; 