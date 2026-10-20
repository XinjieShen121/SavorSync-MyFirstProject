import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRecipes } from '../../services/apiRecipe';
import RecipeCard from '../../components/RecipeCard';
import { EmptyState, ErrorState, LoadingState, RecipeGridSkeleton } from '../../components/ui/States';
import '../../styles/shared-layout.css';
import './TrendingRecipesPage.css';



const TrendingRecipesPage: React.FC = () => {
  const navigate = useNavigate();
  const [trendingRecipes, setTrendingRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchTrendingRecipes = async () => {
      try {
        setLoading(true);
        setFailed(false);
        const allRecipes = await getAllRecipes();
        // Get first 3 recipes as trending (you can implement more sophisticated trending logic later)
        const trending = allRecipes.slice(0, 3);
        setTrendingRecipes(trending);
      } catch (error) {
        console.error('Error fetching trending recipes:', error);
        setFailed(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingRecipes();
  }, [reloadKey]);

  // Loading, error and empty states (design.md 4.7)
  if (loading || failed || trendingRecipes.length === 0) {
    return (
      <div className="recipe-page-container">
        <div className="recipe-page-wrapper">
          <h1 className="recipe-page-title">Trending Recipes</h1>
          {loading ? (
            <LoadingState label="Loading trending recipes">
              <RecipeGridSkeleton count={3} />
            </LoadingState>
          ) : failed ? (
            <ErrorState onRetry={() => setReloadKey((k) => k + 1)} exit={{ label: 'Back to recipes', to: '/all-recipes' }} />
          ) : (
            <EmptyState
              icon="bi-search"
              title="No trending recipes yet"
              body="Check back soon, or browse every dish for now."
              action={{ label: 'Browse all recipes', to: '/all-recipes', variant: 'secondary' }}
            />
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
          <button className="recipe-page-back-button" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
          <h1 className="recipe-page-title">🔥 Trending Recipes</h1>
          <p className="recipe-page-subtitle">
            Discover the most popular and trending recipes from all over the world
          </p>
        </div>

        {/* Recipe Grid */}
        <div className="recipe-page-grid">
          {trendingRecipes.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              onClick={() => navigate(`/recipe/${recipe._id}`)}
            />
          ))}
        </div>
        
        <div className="view-all-recipes">
          <button 
            className="view-all-btn"
            onClick={() => navigate('/all-recipes')}
          >
            View All Recipes
            <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrendingRecipesPage; 