import React from 'react';
import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';
import TypeCover from './TypeCover';
import { totalMinutes, formatMinutes, normalizeDifficulty, recipeDiets, DIET_LABELS } from '../utils/recipeFacts';
import './RecipeCard.css';

export interface RecipeCardRecipe {
  _id: string;
  recipe_name?: string;
  title?: string;
  cuisine?: string;
  region?: string;
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

// Recipe card (design.md 4.3): an unboxed editorial card. Photo (or type cover)
// with the heart, then cuisine label, title and facts from the recipe's own data.
const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const name = recipe.recipe_name || recipe.title || 'Untitled recipe';
  const image = recipe.image_url || recipe.image;
  const minutes = totalMinutes(recipe);
  const difficulty = normalizeDifficulty(recipe.difficulty);
  const diet = recipeDiets(recipe)[0];

  const meta = [
    minutes !== null ? formatMinutes(minutes) : null,
    difficulty,
    diet ? DIET_LABELS[diet] : null,
  ].filter(Boolean).join(' · ');

  return (
    <article className="recipe-card">
      <Link to={`/recipe/${recipe._id}`} className="recipe-card__link">
        <div className="recipe-card__media">
          {image ? (
            <img src={image} alt="" className="recipe-card__image" loading="lazy" />
          ) : (
            <TypeCover title={recipe.cuisine || name} kicker={recipe.region} region={recipe.region} />
          )}
        </div>
        <div className="recipe-card__body">
          {recipe.cuisine && <p className="recipe-card__kicker">{recipe.cuisine}</p>}
          <h3 className="recipe-card__title">{name}</h3>
          {meta && <p className="recipe-card__meta">{meta}</p>}
        </div>
      </Link>
      <div className="recipe-card__favorite">
        <FavoriteButton recipeId={recipe._id} recipeName={name} variant="overlay" />
      </div>
    </article>
  );
};

export default RecipeCard;
