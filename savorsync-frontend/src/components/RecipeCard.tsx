import React from 'react';
import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';
import { totalMinutes, formatMinutes, normalizeDifficulty, recipeDiets, DIET_LABELS } from '../utils/recipeFacts';
import './RecipeCard.css';

export interface RecipeCardRecipe {
  _id: string;
  recipe_name?: string;
  title?: string;
  cuisine?: string;
  image?: string;
  image_url?: string;
  prep_time?: string;
  cook_time?: string;
  prepTime?: string;
  cookTime?: string;
  difficulty?: string;
  tags?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
}

interface RecipeCardProps {
  recipe: RecipeCardRecipe;
}

// Recipe card (design.md 4.3): photo with cuisine badge and heart, title, and
// at most two facts taken from the recipe's own data.
const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const name = recipe.recipe_name || recipe.title || 'Untitled recipe';
  const image = recipe.image_url || recipe.image;
  const minutes = totalMinutes(recipe);
  const difficulty = normalizeDifficulty(recipe.difficulty);
  const diet = recipeDiets(recipe)[0];

  return (
    <article className="recipe-card">
      <Link to={`/recipe/${recipe._id}`} className="recipe-card__link">
        <div className="recipe-card__media">
          {image ? (
            <img src={image} alt="" className="recipe-card__image" loading="lazy" />
          ) : (
            <i className="bi bi-image recipe-card__placeholder" aria-hidden="true"></i>
          )}
          {recipe.cuisine && <span className="badge badge--cuisine recipe-card__cuisine">{recipe.cuisine}</span>}
        </div>
        <div className="recipe-card__body">
          <h3 className="recipe-card__title">{name}</h3>
          {(minutes !== null || difficulty || diet) && (
            <p className="recipe-card__meta">
              {minutes !== null && (
                <span><i className="bi bi-clock" aria-hidden="true"></i>{formatMinutes(minutes)}</span>
              )}
              {difficulty && (
                <span><i className="bi bi-bar-chart" aria-hidden="true"></i>{difficulty}</span>
              )}
              {(minutes === null || !difficulty) && diet && (
                <span className="badge badge--diet">{DIET_LABELS[diet]}</span>
              )}
            </p>
          )}
        </div>
      </Link>
      <div className="recipe-card__favorite">
        <FavoriteButton recipeId={recipe._id} recipeName={name} variant="overlay" />
      </div>
    </article>
  );
};

export default RecipeCard;
