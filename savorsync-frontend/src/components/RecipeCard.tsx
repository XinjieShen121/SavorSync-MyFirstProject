import React from 'react';
import { FaClock, FaUsers, FaChartBar } from 'react-icons/fa';
import './RecipeCard.css';

interface RecipeCardProps {
  recipe: any;
  onClick?: () => void;
  showOverlay?: boolean;
}

// Helper functions to calculate recipe metrics
const getEstimatedCookTime = (recipe: any): string => {
  const instructionCount = recipe.instructions?.length || 0;
  const ingredientCount = recipe.ingredients?.length || 0;
  
  // Base time: 15 minutes + 2 minutes per instruction + 1 minute per ingredient
  const totalMinutes = 15 + (instructionCount * 2) + ingredientCount;
  
  if (totalMinutes < 30) return '20-30 min';
  if (totalMinutes < 60) return '30-45 min';
  if (totalMinutes < 90) return '45-60 min';
  return '60+ min';
};

const getEstimatedServings = (recipe: any): string => {
  // Check ingredients for serving indicators
  if (recipe.ingredients) {
    for (const ingredient of recipe.ingredients) {
      const lowerIngredient = ingredient.toLowerCase();
      if (lowerIngredient.includes('4 servings') || lowerIngredient.includes('4 people')) return '4 servings';
      if (lowerIngredient.includes('6 servings') || lowerIngredient.includes('6 people')) return '6 servings';
      if (lowerIngredient.includes('2 servings') || lowerIngredient.includes('2 people')) return '2 servings';
    }
  }
  
  // Default based on cuisine type
  const cuisineServings: { [key: string]: string } = {
    'Italian': '4 servings',
    'Indian': '4-6 servings',
    'Chinese': '4 servings',
    'Mexican': '4 servings',
    'Japanese': '2-4 servings',
    'French': '4 servings',
    'Thai': '4 servings',
    'Greek': '4 servings',
    'Spanish': '4 servings',
    'Korean': '4 servings',
    'Lebanese': '4 servings',
    'Vietnamese': '4 servings'
  };
  
  return cuisineServings[recipe.cuisine] || '4 servings';
};

const getComplexityLevel = (recipe: any): string => {
  // Use spice level if available
  if (recipe.spiceLevel && recipe.spiceLevel !== 'Medium') {
    return recipe.spiceLevel;
  }
  
  // Calculate complexity based on instruction and ingredient count
  const instructionCount = recipe.instructions?.length || 0;
  const ingredientCount = recipe.ingredients?.length || 0;
  
  const complexity = instructionCount + ingredientCount;
  
  if (complexity < 15) return 'Easy';
  if (complexity < 20) return 'Medium';
  return 'Hard';
};

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick, showOverlay = true }) => {
  return (
    <div 
      className="recipe-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="recipe-image">
        <img 
          src={recipe.image_url || recipe.image} 
          alt={recipe.recipe_name || recipe.title}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop';
          }}
        />
        {showOverlay && (
          <div className="recipe-overlay">
            <span className="cuisine-badge">{recipe.cuisine}</span>
          </div>
        )}
      </div>
      
      <div className="recipe-content">
        <h3 className="recipe-title">{recipe.recipe_name || recipe.title}</h3>
        <p className="recipe-subtitle">{recipe.subtitle || ''}</p>
        
        {/* Standardized Metric Pills */}
        <div className="recipe-metrics">
          <div className="metric-pill metric-time">
            <FaClock className="metric-icon" />
            <span className="metric-text">{getEstimatedCookTime(recipe)}</span>
          </div>
          <div className="metric-pill metric-servings">
            <FaUsers className="metric-icon" />
            <span className="metric-text">{getEstimatedServings(recipe)}</span>
          </div>
          <div className="metric-pill metric-difficulty">
            <FaChartBar className="metric-icon" />
            <span className="metric-text">{getComplexityLevel(recipe)}</span>
          </div>
        </div>
        
        <div className="recipe-tags">
          {recipe.tags && recipe.tags.slice(0, 3).map((tag: string, index: number) => (
            <span key={index} className="recipe-tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard; 