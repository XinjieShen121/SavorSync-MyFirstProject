import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getTrendingRecipes } from '../../services/apiRecipe';
import RecipeCard, { RecipeCardRecipe } from '../../components/RecipeCard';
import { EmptyState, ErrorState, LoadingState, RecipeGridSkeleton } from '../../components/ui/States';
import '../../styles/shared-layout.css';
import '../../styles/browse.css';
import './TrendingRecipesPage.css';

interface TrendingRecipe extends RecipeCardRecipe {
  trending?: { favorites: number; recentReviews: number } | null;
}

const reasonFor = (recipe: TrendingRecipe) => {
  const stats = recipe.trending;
  if (!stats) return null;
  const parts = [];
  if (stats.favorites) parts.push(`${stats.favorites} ${stats.favorites === 1 ? 'save' : 'saves'}`);
  if (stats.recentReviews) parts.push(`${stats.recentReviews} cooked this month`);
  return parts.join(' · ') || null;
};

// Trending (design.md 5.3): ranked by what cooks save and make
const TrendingRecipesPage: React.FC = () => {
  const [recipes, setRecipes] = useState<TrendingRecipe[]>([]);
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');

  const load = useCallback(async () => {
    setState('loading');
    try {
      setRecipes(await getTrendingRecipes(12));
      setState('ready');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const ranked = recipes.filter(recipe => recipe.trending);
  const featured = recipes.filter(recipe => !recipe.trending);

  return (
    <div className="browse">
      <div className="browse__inner">
        <header className="browse__header">
          <h1 className="browse__title">Trending this week</h1>
          <p className="browse__lead">The dishes cooks are saving and making right now.</p>
        </header>

        {state === 'loading' && (
          <LoadingState label="Loading trending recipes">
            <RecipeGridSkeleton count={8} />
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

        {state === 'ready' && ranked.length > 0 && (
          <ol className="recipe-page-grid trending-list">
            {ranked.map((recipe, index) => (
              <li key={recipe._id} className="trending-item">
                <span className="trending-item__rank" aria-label={`Number ${index + 1}`}>{index + 1}</span>
                <RecipeCard recipe={recipe} />
                {reasonFor(recipe) && <p className="trending-item__reason">{reasonFor(recipe)}</p>}
              </li>
            ))}
          </ol>
        )}

        {state === 'ready' && featured.length > 0 && (
          <section className="trending-featured" aria-labelledby="trending-featured-title">
            <h2 id="trending-featured-title" className="trending-featured__title">
              {ranked.length ? 'Also worth cooking' : 'Featured dishes'}
            </h2>
            {!ranked.length && (
              <p className="browse__lead trending-featured__lead">
                Rankings start once cooks save and review recipes. Tap the heart on dishes you love.
              </p>
            )}
            <div className="recipe-page-grid">
              {featured.map(recipe => <RecipeCard key={recipe._id} recipe={recipe} />)}
            </div>
          </section>
        )}

        {state === 'ready' && recipes.length > 0 && (
          <div className="browse__more">
            <Link to="/all-recipes" className="btn btn--secondary trending-all">
              Browse all recipes
              <i className="bi bi-arrow-right" aria-hidden="true"></i>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingRecipesPage;
