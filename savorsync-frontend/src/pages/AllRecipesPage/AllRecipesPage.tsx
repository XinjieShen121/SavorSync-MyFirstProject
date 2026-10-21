import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllCuisines, getRecipesWithFilter, getAllRecipes } from '../../services/apiRecipe';
import RecipeCard from '../../components/RecipeCard';
import { EmptyState, ErrorState, LoadingState, RecipeGridSkeleton } from '../../components/ui/States';
import '../../styles/shared-layout.css';
import './AllRecipesPage.css';



const AllRecipesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Fetch cuisines and initial recipes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all cuisines
        console.log('🔍 Fetching cuisines...');
        const cuisinesData = await getAllCuisines();
        console.log('🌍 Available cuisines:', cuisinesData);
        setCuisines(cuisinesData);

        // Fetch initial recipes
        console.log('🍽️ Fetching initial recipes...');
        const recipesData = await getAllRecipes();
        console.log(`📊 Initial recipes: ${recipesData.length} recipes loaded`);
        console.log('📊 First few recipes:', recipesData.slice(0, 3).map((r: any) => r.recipe_name));
        setRecipes(recipesData);
        setHasMore(false); // No pagination needed since we're loading all recipes

      } catch (err: any) {
        console.error('❌ Error fetching data:', err);
        setError(err.message || 'Failed to fetch recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reloadKey]);

  const retry = () => {
    if (selectedCuisine === 'all') setReloadKey((k) => k + 1);
    else handleCuisineFilter(selectedCuisine);
  };

  // Handle cuisine filter change
  const handleCuisineFilter = async (cuisine: string) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedCuisine(cuisine);
      setCurrentPage(1);

      console.log(`🔍 Filtering recipes by cuisine: ${cuisine}`);
      
      if (cuisine === 'all') {
        // Load all recipes when "all" is selected
        const data = await getAllRecipes();
        console.log(`📊 Found ${data.length} total recipes for "all" cuisine`);
        console.log('📊 First few recipes:', data.slice(0, 3).map((r: any) => r.recipe_name));
        setRecipes(data);
        setHasMore(false);
      } else {
        // Use filtered API for specific cuisines
        const data = await getRecipesWithFilter(cuisine, 1, 50); // Increased limit for filtered results
        console.log(`📊 Found ${data.recipes.length} recipes for ${cuisine}`);
        console.log('📊 First few recipes:', data.recipes.slice(0, 3).map((r: any) => r.recipe_name));
        setRecipes(data.recipes);
        setHasMore(data.pagination.hasMore);
      }
    } catch (err: any) {
      console.error('❌ Error filtering recipes:', err);
      setError(err.message || 'Failed to filter recipes');
    } finally {
      setLoading(false);
    }
  };

  // Load more recipes
  const loadMoreRecipes = async () => {
    try {
      const nextPage = currentPage + 1;
      console.log(`📄 Loading page ${nextPage} for cuisine: ${selectedCuisine}`);
      
      if (selectedCuisine === 'all') {
        // For "all" cuisine, we already have all recipes loaded
        console.log('📄 All recipes already loaded, no more to load');
        setHasMore(false);
        return;
      }
      
      const data = await getRecipesWithFilter(selectedCuisine, nextPage, 50); // Increased limit
      setRecipes(prev => [...prev, ...data.recipes]);
      setCurrentPage(nextPage);
      setHasMore(data.pagination.hasMore);
    } catch (err: any) {
      console.error('❌ Error loading more recipes:', err);
      setError(err.message || 'Failed to load more recipes');
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  // Search from the home page hero (?q=): match name, cuisine, tags or ingredients
  const visibleRecipes = query
    ? recipes.filter((recipe) => {
        const needle = query.toLowerCase();
        const haystack = [
          recipe.recipe_name,
          recipe.title,
          recipe.cuisine,
          ...(Array.isArray(recipe.tags) ? recipe.tags : []),
          ...(Array.isArray(recipe.ingredients) ? recipe.ingredients : []),
        ];
        return haystack.some((field) => typeof field === 'string' && field.toLowerCase().includes(needle));
      })
    : recipes;

  const clearSearch = () => setSearchParams({});

  // First load: skeleton grid or a full-page error (design.md 4.7)
  if ((loading || error) && recipes.length === 0 && cuisines.length === 0) {
    return (
      <div className="recipe-page-container">
        <div className="recipe-page-wrapper">
          <h1 className="recipe-page-title">All Recipes</h1>
          {error ? (
            <ErrorState onRetry={retry} exit={{ label: 'Back to home', to: '/' }} />
          ) : (
            <LoadingState label="Loading recipes">
              <RecipeGridSkeleton />
            </LoadingState>
          )}
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
            ← Back to Home
          </button>
          <h1 className="recipe-page-title">All Recipes</h1>
          <p className="recipe-page-subtitle">
            {query
              ? `${visibleRecipes.length} ${visibleRecipes.length === 1 ? 'recipe matches' : 'recipes match'} "${query}"`
              : `Discover ${recipes.length} delicious recipes from around the world`}
          </p>
        </div>

        {/* Cuisine Filters */}
        <div className="recipe-page-filters">
          <div className="filters-header">
            <h3>Filter by Cuisine</h3>
            <span className="recipe-count">
              {visibleRecipes.length} {selectedCuisine === 'all' ? 'total' : selectedCuisine} recipes
            </span>
          </div>
          
          <div className="filter-buttons">
            <button
              className={`filter-btn ${selectedCuisine === 'all' ? 'active' : ''}`}
              onClick={() => handleCuisineFilter('all')}
            >
              All Cuisines
            </button>
            
            {cuisines.map((cuisine) => (
              <button
                key={cuisine}
                className={`filter-btn ${selectedCuisine === cuisine ? 'active' : ''}`}
                onClick={() => handleCuisineFilter(cuisine)}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe Grid, or the loading / error / empty state for the current filter */}
        {loading ? (
          <LoadingState label="Loading recipes">
            <RecipeGridSkeleton />
          </LoadingState>
        ) : error ? (
          <ErrorState onRetry={retry} exit={{ label: 'Back to home', to: '/' }} />
        ) : visibleRecipes.length === 0 ? (
          query ? (
            <EmptyState
              icon="bi-search"
              title={`Nothing found for "${query}"`}
              body="Check the spelling or try a dish name."
              action={{ label: 'Clear search', onClick: clearSearch, variant: 'ghost' }}
            />
          ) : (
            <EmptyState
              icon="bi-search"
              title="No recipes match"
              body="Try another cuisine or clear the filters."
              action={{ label: 'Clear filters', onClick: () => handleCuisineFilter('all'), variant: 'ghost' }}
            />
          )
        ) : (
        <div className="recipe-page-grid">
          {visibleRecipes.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe} />
          ))}
        </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="load-more-section">
            <button 
              className="load-more-btn"
              onClick={loadMoreRecipes}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More Recipes'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AllRecipesPage; 