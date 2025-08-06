import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getRecipesByCuisine, getAllRecipes, getRecipesWithFilter } from '../../services/apiRecipe';
import RecipeCard from '../../components/RecipeCard';
import '../../styles/shared-layout.css';
import './CuisinePage.css';



const CuisinePage: React.FC = () => {
  console.log('🔥 CuisinePage component loaded');
  
  const { cuisineId } = useParams<{ cuisineId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [allRecipes, setAllRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentStep, setCurrentStep] = useState(1);
  
  console.log('🏠 Current cuisineId:', cuisineId);
  
  // Get QuickStart data from navigation state
  const quickStartData = location.state as {
    mood?: string;
    time?: string;
    quickStart?: boolean;
  } | null;
  
  // Map cuisine IDs to cuisine names (expanded to match real database)
  const cuisineMap: { [key: string]: string } = {
    'asian': 'Asian',
    'mediterranean': 'Mediterranean',
    'latin': 'Latin',
    'american': 'American',
    'italian': 'Italian',
    'indian': 'Indian',
    'chinese': 'Chinese',
    'mexican': 'Mexican',
    'japanese': 'Japanese',
    'french': 'French',
    'thai': 'Thai',
    'greek': 'Greek',
    'spanish': 'Spanish',
    'korean': 'Korean',
    'lebanese': 'Lebanese',
    'vietnamese': 'Vietnamese'
  };
  
  const cuisineName = cuisineMap[cuisineId || ''] || cuisineId || 'Unknown';
  
  // Define country filters based on cuisine type
  const getCountryFilters = (cuisine: string) => {
    const filterMap: { [key: string]: string[] } = {
      'Asian': ['All', 'Chinese', 'Japanese', 'Korean', 'Thai', 'Vietnamese', 'Indian'],
      'Mediterranean': ['All', 'Greek', 'Italian', 'Spanish', 'Turkish', 'Lebanese', 'Moroccan'],
      'Latin': ['All', 'Mexican', 'Brazilian', 'Argentinian', 'Peruvian', 'Colombian', 'Cuban'],
      'American': ['All', 'Southern', 'Tex-Mex', 'Cajun', 'New England', 'California', 'Midwest'],
      'European': ['All', 'French', 'Italian', 'German', 'Spanish', 'Greek', 'British'],
      'African': ['All', 'Moroccan', 'Ethiopian', 'Nigerian', 'South African', 'Egyptian', 'Kenyan'],
      'Middle Eastern': ['All', 'Lebanese', 'Turkish', 'Iranian', 'Israeli', 'Jordanian', 'Syrian'],
      'Indian': ['All', 'North Indian', 'South Indian', 'Bengali', 'Punjabi', 'Gujarati', 'Maharashtrian']
    };
    
    // Return specific filters for known cuisines, or default to 'All'
    return filterMap[cuisine] || ['All'];
  };
  
  const countryFilters = getCountryFilters(cuisineName);
  console.log('🎯 Country filters for', cuisineName, ':', countryFilters);
  
  // Get the first recipe from this cuisine to display
  const recipe = recipes.length > 0 ? recipes[0] : null;

  // Filter recipes by time if QuickStart data is available
  const filterRecipesByTime = (recipes: any[], maxTime: string) => {
    if (!maxTime) return recipes;
    
    const maxMinutes = parseInt(maxTime);
    
    return recipes.filter(recipe => {
      // Parse prep time and cook time
      const prepTimeStr = recipe.prepTime || '0 minutes';
      const cookTimeStr = recipe.cookTime || '0 minutes';
      
      // Parse time strings to handle hours and minutes
      const parseTime = (timeStr: string) => {
        const hoursMatch = timeStr.match(/(\d+)\s*hours?/i);
        const minutesMatch = timeStr.match(/(\d+)\s*minutes?/i);
        
        const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
        const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
        
        return hours * 60 + minutes;
      };
      
      const prepMinutes = parseTime(prepTimeStr);
      const cookMinutes = parseTime(cookTimeStr);
      
      const totalTime = prepMinutes + cookMinutes;
      
      return totalTime <= maxMinutes;
    });
  };

  // Fetch recipes when component mounts
  useEffect(() => {
    console.log('🚀 Fetching recipes for:', cuisineName);
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (cuisineName) {
          try {
            const data = await getRecipesByCuisine(cuisineName);
            
            // Apply time filter if QuickStart data is available
            let filteredRecipes = data;
            if (quickStartData?.time) {
              filteredRecipes = filterRecipesByTime(data, quickStartData.time);
            }
            
            setAllRecipes(data); // Store all recipes for filtering
            setRecipes(filteredRecipes); // Set initial recipes (filtered by time if needed)
            console.log('✅ Recipes fetched successfully for:', cuisineName);
          } catch (error: any) {
            console.error(`❌ Frontend: Error fetching recipes for ${cuisineName}:`, error);
            setError(error.message || 'Failed to load recipes');
            console.error('❌ Error fetching recipes:', error);
          } finally {
            setLoading(false);
            console.log('✅ Loading state set to false for:', cuisineName);
          }
        }
      } catch (err: any) {
        console.error('Error fetching recipes:', err);
        setError(err.message || 'Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [cuisineName, quickStartData?.time]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleFilterClick = async (filter: string) => {
    console.log('🔍 Filter clicked:', filter);
    console.log('🏠 Current cuisine:', cuisineName);
    
    setActiveFilter(filter);
    setLoading(true);
    
    try {
      let filteredRecipes;
      
      if (filter === 'All') {
        console.log('📋 Using getRecipesByCuisine for "All"');
        // Use getRecipesByCuisine for consistency with the main cuisine
        filteredRecipes = await getRecipesByCuisine(cuisineName);
      } else {
        // Check if this is an American regional filter
        const americanRegions = ['Southern', 'Tex-Mex', 'Cajun', 'New England', 'California', 'Midwest'];
        
        if (americanRegions.includes(filter)) {
          console.log('🇺🇸 American regional filter detected:', filter);
          console.log('📡 Using getRecipesWithFilter for regional filtering');
          // For American regional filters, use getRecipesWithFilter to hit the general endpoint
          filteredRecipes = await getRecipesWithFilter(filter, 1, 50);
        } else {
          console.log('🌍 Non-American filter detected:', filter);
          console.log('📡 Using getRecipesByCuisine for cuisine filtering');
          // For other cuisines (Japanese, Chinese, etc.), use the cuisine-specific endpoint
          filteredRecipes = await getRecipesByCuisine(filter);
        }
      }
      
      console.log('📊 RAW API Response:', filteredRecipes);
      console.log('📊 Response type:', typeof filteredRecipes);
      console.log('📊 Is array?:', Array.isArray(filteredRecipes));
      console.log('📊 Response length/keys:', Array.isArray(filteredRecipes) ? filteredRecipes.length : Object.keys(filteredRecipes || {}));
      
      // Ensure filteredRecipes is always an array
      if (!Array.isArray(filteredRecipes)) {
        console.warn('⚠️ API returned non-array response, attempting to extract recipes array');
        console.warn('⚠️ Full response structure:', filteredRecipes);
        
        // Try to extract recipes array from response object
        if (filteredRecipes && filteredRecipes.recipes && Array.isArray(filteredRecipes.recipes)) {
          console.log('✅ Found recipes array in response.recipes');
          filteredRecipes = filteredRecipes.recipes;
        } else if (filteredRecipes && filteredRecipes.data && Array.isArray(filteredRecipes.data)) {
          console.log('✅ Found recipes array in response.data');
          filteredRecipes = filteredRecipes.data;
        } else {
          console.error('❌ Could not find recipes array in response, setting to empty array');
          filteredRecipes = [];
        }
      }
      
      console.log('📊 Final processed recipes:', filteredRecipes?.length || 0, 'recipes');
      
      // Apply time filter if set
      if (quickStartData?.time) {
        filteredRecipes = filterRecipesByTime(filteredRecipes, quickStartData.time);
        console.log('⏰ After time filtering:', filteredRecipes?.length || 0);
      }
      
      console.log('📝 Setting recipes state to:', filteredRecipes);
      setRecipes(filteredRecipes);
    } catch (error: any) {
      console.error('❌ Error fetching filtered recipes:', error);
      setError('Failed to load recipes');
      // Always set recipes to empty array on error
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="recipe-page-container">
        <div className="recipe-page-wrapper">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading {cuisineName} recipes...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="recipe-page-container">
        <div className="recipe-page-wrapper">
          <div className="error">
            <h2>Error</h2>
            <p>{error}</p>
            <button className="recipe-page-back-button" onClick={handleBackToHome}>
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe-page-container">
      <div className="recipe-page-wrapper">
        {/* Header */}
        <div className="recipe-page-header">
          <button className="recipe-page-back-button" onClick={handleBackToHome}>
            ← Back to Cuisines
          </button>
          <h1 className="recipe-page-title">{cuisineName} Cuisine</h1>
          <p className="recipe-page-subtitle">
            Discover traditional {cuisineName} dishes and their cultural significance
            {quickStartData?.time && (
              <span className="time-filter-info">
                {recipes.length === allRecipes.length ? 
                  `• No recipes found within ${quickStartData.time} minutes, showing all recipes` :
                  `• Filtered to ${quickStartData.time} minutes or less`
                }
              </span>
            )}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="recipe-page-filters">
          <div className="filters-header">
            <h3>Filter by Region</h3>
            <span className="recipe-count">
              {recipes.length} {cuisineName} recipes
            </span>
          </div>
          <div className="filter-buttons">
            {countryFilters.map(filter => (
              <button 
                key={filter}
                className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => {
                  console.log('🖱️ BUTTON CLICKED:', filter);
                  handleFilterClick(filter);
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe Cards Grid */}
        <div className="recipe-page-grid">
          {(() => {
            console.log('🍽️ Current recipes in render:', Array.isArray(recipes) ? recipes.length : 'NOT ARRAY', 'recipes');
            console.log('🔍 Active filter:', activeFilter);
            console.log('🔍 Recipes type:', typeof recipes);
            return null;
          })()}
          {!Array.isArray(recipes) || recipes.length === 0 ? (
            <div className="no-recipes">
              <h3>No recipes found</h3>
              <p>Try selecting a different filter or check back later for new recipes.</p>
            </div>
          ) : (
            recipes.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                onClick={() => navigate(`/recipe/${recipe._id}`)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CuisinePage; 