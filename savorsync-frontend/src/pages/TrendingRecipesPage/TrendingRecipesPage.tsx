import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getTrendingRecipes } from '../../services/apiRecipe';
import RecipeCard, { RecipeCardRecipe } from '../../components/RecipeCard';
import TypeCover from '../../components/TypeCover';
import { EmptyState, ErrorState, LoadingState, RecipeGridSkeleton } from '../../components/ui/States';
import { totalMinutes, formatMinutes, normalizeDifficulty } from '../../utils/recipeFacts';
import '../../styles/shared-layout.css';
import '../../styles/browse.css';
import './TrendingRecipesPage.css';

interface TrendingRecipe extends RecipeCardRecipe {
  subtitle?: string;
  trending?: { favorites: number; recentReviews: number } | null;
}

const CHART_SIZE = 8;

const nameOf = (recipe: TrendingRecipe) => recipe.recipe_name || recipe.title || 'Untitled recipe';
const imageOf = (recipe: TrendingRecipe) => recipe.image_url || recipe.image;

// Why a dish is on the list, from the API's real counts
const reasonFor = (recipe: TrendingRecipe) => {
  const stats = recipe.trending;
  if (!stats) return null;
  const parts = [];
  if (stats.favorites) parts.push(`${stats.favorites} ${stats.favorites === 1 ? 'save' : 'saves'}`);
  if (stats.recentReviews) parts.push(`${stats.recentReviews} cooked this month`);
  return parts.join(' · ') || null;
};

const factsFor = (recipe: TrendingRecipe) => {
  const minutes = totalMinutes(recipe);
  return [minutes !== null ? formatMinutes(minutes) : null, normalizeDifficulty(recipe.difficulty)].filter(Boolean) as string[];
};

const Cover: React.FC<{ recipe: TrendingRecipe; size?: 'card' | 'hero' }> = ({ recipe, size = 'card' }) => {
  const image = imageOf(recipe);
  return image
    ? <img src={image} alt="" className="trending-cover__image" loading={size === 'hero' ? 'eager' : 'lazy'} />
    : <TypeCover title={recipe.cuisine || nameOf(recipe)} kicker={recipe.region} region={recipe.region} size={size} />;
};

// Trending (design.md 5.3): number one as a split lead, the next eight as a
// numbered chart, anything else as cards. Without rankings the same layout
// shows featured dishes with no numbers, so it never claims a rank it lacks.
const TrendingRecipesPage: React.FC = () => {
  const [recipes, setRecipes] = useState<TrendingRecipe[]>([]);
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');

  const load = useCallback(async () => {
    setState('loading');
    try {
      setRecipes(await getTrendingRecipes(16));
      setState('ready');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const ranked = recipes.filter(recipe => recipe.trending);
  const isRanked = ranked.length > 0;
  const items = isRanked ? ranked : recipes;
  const lead = items[0];
  const chart = items.slice(1, 1 + CHART_SIZE);
  const rest = isRanked
    ? [...ranked.slice(1 + CHART_SIZE), ...recipes.filter(recipe => !recipe.trending)]
    : items.slice(1 + CHART_SIZE);

  return (
    <div className="browse trending">
      <div className="browse__inner">
        <header className="trending__intro">
          <p className="browse__kicker">{isRanked || state !== 'ready' ? 'Trending now' : 'Featured dishes'}</p>
          <h1 className="browse__title">What everyone is cooking</h1>
          <p className="browse__deck">
            {isRanked || state !== 'ready'
              ? 'Ranked by how often cooks save and review each dish.'
              : 'Rankings start once cooks save and review recipes. Until then, here are good places to start.'}
          </p>
        </header>

        {state === 'loading' && (
          <LoadingState label="Loading trending recipes">
            <RecipeGridSkeleton count={6} />
          </LoadingState>
        )}

        {state === 'error' && <ErrorState onRetry={load} exit={{ label: 'Browse all recipes', to: '/all-recipes' }} />}

        {state === 'ready' && recipes.length === 0 && (
          <EmptyState
            icon="bi-graph-up-arrow"
            title="Nothing trending yet"
            body="Save a recipe or tell us you made one, and it shows up here."
            action={{ label: 'Browse all recipes', to: '/all-recipes', variant: 'secondary' }}
          />
        )}

        {state === 'ready' && lead && (
          <article className="trending-lead" aria-labelledby="trending-lead-title">
            <Link to={`/recipe/${lead._id}`} className="trending-lead__media" tabIndex={-1} aria-hidden="true">
              <Cover recipe={lead} size="hero" />
            </Link>
            <div className="trending-lead__body">
              {isRanked && <span className="trending-lead__rank" aria-hidden="true">1</span>}
              <p className="browse__kicker trending-lead__kicker">
                {isRanked && <span className="visually-hidden">Number 1. </span>}
                {[lead.cuisine, lead.region].filter(Boolean).join(' · ')}
              </p>
              <h2 id="trending-lead-title" className="trending-lead__title">
                <Link to={`/recipe/${lead._id}`}>{nameOf(lead)}</Link>
              </h2>
              {lead.subtitle && <p className="trending-lead__deck">{lead.subtitle}</p>}
              <p className="trending-lead__facts">
                {reasonFor(lead) && <strong>{reasonFor(lead)}</strong>}
                {factsFor(lead).map(fact => <span key={fact}>{fact}</span>)}
              </p>
              <Link to={`/recipe/${lead._id}`} className="btn btn--primary trending-lead__cook">Cook this dish</Link>
            </div>
          </article>
        )}

        {state === 'ready' && chart.length > 0 && (
          <ol className={`trending-chart${isRanked ? '' : ' trending-chart--plain'}`} start={2}
            aria-label={isRanked ? 'Numbers 2 to ' + (chart.length + 1) : 'More featured dishes'}>
            {chart.map((recipe, index) => (
              <li key={recipe._id}>
                <Link to={`/recipe/${recipe._id}`} className="trending-row">
                  {isRanked && <span className="trending-row__rank" aria-hidden="true">{index + 2}</span>}
                  <span className="trending-row__thumb"><Cover recipe={recipe} /></span>
                  <span className="trending-row__body">
                    {recipe.cuisine && <span className="trending-row__kicker">{recipe.cuisine}</span>}
                    <span className="trending-row__title">
                      {isRanked && <span className="visually-hidden">Number {index + 2}. </span>}
                      {nameOf(recipe)}
                    </span>
                    <span className="trending-row__meta">{[reasonFor(recipe), ...factsFor(recipe)].filter(Boolean).join(' · ')}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}

        {state === 'ready' && rest.length > 0 && (
          <section className="trending-featured" aria-labelledby="trending-featured-title">
            <h2 id="trending-featured-title" className="trending-featured__title">Also worth cooking</h2>
            <div className="recipe-page-grid">
              {rest.map(recipe => <RecipeCard key={recipe._id} recipe={recipe} />)}
            </div>
          </section>
        )}

        {state === 'ready' && recipes.length > 0 && (
          <p className="trending__note">
            Saved a dish you love? Tap the heart on any recipe and it counts toward this list.{' '}
            <Link to="/all-recipes">Browse all recipes</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default TrendingRecipesPage;
