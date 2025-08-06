import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRecipes } from '../../services/apiRecipe';
import RecipeCard from '../../components/RecipeCard';
import '../../styles/shared-layout.css';
import './TrendingRecipesPage.css';



const TrendingRecipesPage: React.FC = () => {
  const navigate = useNavigate();
  const [trendingRecipes, setTrendingRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingRecipes = async () => {
      try {
        setLoading(true);
        const allRecipes = await getAllRecipes();
        // Get first 3 recipes as trending (you can implement more sophisticated trending logic later)
        const trending = allRecipes.slice(0, 3);
        setTrendingRecipes(trending);
      } catch (error) {
        console.error('Error fetching trending recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingRecipes();
  }, []);

  if (loading) {
    return (
      <div className="recipe-page-container">
        <div className="recipe-page-wrapper">
          <div className="loading">Loading trending recipes...</div>
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