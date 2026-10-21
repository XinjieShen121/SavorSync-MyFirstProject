import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { getRecipesByCuisine } from '../../services/apiRecipe';
import RecipeCard, { RecipeCardRecipe } from '../../components/RecipeCard';
import { EmptyState, ErrorState, LoadingState, RecipeGridSkeleton } from '../../components/ui/States';
import { totalMinutes } from '../../utils/recipeFacts';
import '../../styles/shared-layout.css';
import '../../styles/browse.css';

interface CuisineRecipe extends RecipeCardRecipe {
  region?: string;
}

const CUISINE_NAMES: Record<string, string> = {
  asian: 'Asian',
  mediterranean: 'Mediterranean',
  latin: 'Latin',
  american: 'American',
  italian: 'Italian',
  indian: 'Indian',
  chinese: 'Chinese',
  mexican: 'Mexican',
  japanese: 'Japanese',
  french: 'French',
  thai: 'Thai',
  greek: 'Greek',
  spanish: 'Spanish',
  korean: 'Korean',
  lebanese: 'Lebanese',
  vietnamese: 'Vietnamese',
};

// Broad groupings that are not useful as a region chip
const BROAD_REGIONS = ['asian', 'european', 'latin', 'american', 'mediterranean', 'middle eastern', 'african'];

// The finer label a recipe has inside this cuisine: its own cuisine (Japanese inside
// Asian) or its region (Southern inside American). Taken from data only.
const regionOf = (recipe: CuisineRecipe, cuisineName: string): string | null => {
  const page = cuisineName.toLowerCase();
  if (recipe.cuisine && recipe.cuisine.toLowerCase() !== page) return recipe.cuisine;
  const region = recipe.region?.trim();
  if (region && region.toLowerCase() !== page && !BROAD_REGIONS.includes(region.toLowerCase())) return region;
  return null;
};

// Cuisine page (design.md 5.3). Region chips are built from the recipes that
// exist, so every chip leads to at least one dish.
const CuisinePage: React.FC = () => {
  const { cuisineId } = useParams<{ cuisineId: string }>();
  const location = useLocation();
  const quickStartTime = (location.state as { time?: string } | null)?.time;
  const cuisineName = CUISINE_NAMES[cuisineId || ''] || cuisineId || 'Unknown';

  const [recipes, setRecipes] = useState<CuisineRecipe[]>([]);
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [region, setRegion] = useState('');

  const load = useCallback(async () => {
    setState('loading');
    setRegion('');
    try {
      const data = await getRecipesByCuisine(cuisineName);
      setRecipes(Array.isArray(data) ? data : data?.recipes || []);
      setState('ready');
    } catch {
      setState('error');
    }
  }, [cuisineName]);

  useEffect(() => { load(); }, [load]);

  const regions = useMemo(() => {
    const counts = new Map<string, number>();
    recipes.forEach(recipe => {
      const label = regionOf(recipe, cuisineName);
      if (label) counts.set(label, (counts.get(label) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [recipes, cuisineName]);

  // Quick Start passes a time limit; recipes without a known time are left out
  const maxMinutes = quickStartTime ? parseInt(quickStartTime, 10) : null;
  const withinTime = useMemo(() => (
    maxMinutes
      ? recipes.filter(recipe => {
          const minutes = totalMinutes(recipe);
          return minutes !== null && minutes <= maxMinutes;
        })
      : recipes
  ), [recipes, maxMinutes]);
  const timeFallback = !!maxMinutes && withinTime.length === 0 && recipes.length > 0;
  const pool = timeFallback ? recipes : withinTime;

  const results = region ? pool.filter(recipe => regionOf(recipe, cuisineName) === region) : pool;

  return (
    <div className="browse">
      <div className="browse__inner">
        <Link to="/all-recipes" className="btn btn--ghost btn--sm browse__back">
          <i className="bi bi-arrow-left" aria-hidden="true"></i>
          All recipes
        </Link>
        <header className="browse__header">
          <h1 className="browse__title">{cuisineName} cuisine</h1>
          <p className="browse__lead">Traditional {cuisineName} dishes and the stories behind them.</p>
          {maxMinutes && state === 'ready' && (
            <p className="browse__note">
              <i className="bi bi-clock" aria-hidden="true"></i>
              {timeFallback
                ? `No dishes fit in ${maxMinutes} minutes, so here are all of them.`
                : `Showing dishes you can make in ${maxMinutes} minutes or less.`}
            </p>
          )}
        </header>

        {state === 'ready' && regions.length > 1 && (
          <div className="browse__filters" aria-label="Filters">
            <div className="browse__filter-row" role="group" aria-label="Region">
              <span className="browse__filter-label">Region</span>
              <div className="browse__chips">
                <button type="button" className="chip" aria-pressed={!region} onClick={() => setRegion('')}>
                  {!region && <i className="bi bi-check" aria-hidden="true"></i>}
                  All
                </button>
                {regions.map(([label]) => (
                  <button
                    key={label}
                    type="button"
                    className="chip"
                    aria-pressed={region === label}
                    onClick={() => setRegion(region === label ? '' : label)}
                  >
                    {region === label && <i className="bi bi-check" aria-hidden="true"></i>}
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {state === 'ready' && recipes.length > 0 && (
          <div className="browse__count-row">
            <p className="browse__count" aria-live="polite">
              {results.length} {results.length === 1 ? 'recipe' : 'recipes'}
            </p>
          </div>
        )}

        {state === 'loading' && (
          <LoadingState label={`Loading ${cuisineName} recipes`}>
            <RecipeGridSkeleton />
          </LoadingState>
        )}

        {state === 'error' && <ErrorState onRetry={load} exit={{ label: 'Browse all recipes', to: '/all-recipes' }} />}

        {state === 'ready' && recipes.length === 0 && (
          <EmptyState
            icon="bi-globe2"
            title={`No ${cuisineName} recipes yet`}
            body="We're adding more dishes soon."
            action={{ label: 'Browse all recipes', to: '/all-recipes', variant: 'secondary' }}
          />
        )}

        {state === 'ready' && results.length > 0 && (
          <div className="recipe-page-grid">
            {results.map(recipe => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CuisinePage;
