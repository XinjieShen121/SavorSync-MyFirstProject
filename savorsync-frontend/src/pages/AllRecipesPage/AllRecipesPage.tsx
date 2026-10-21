import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllRecipes } from '../../services/apiRecipe';
import RecipeCard, { RecipeCardRecipe } from '../../components/RecipeCard';
import { EmptyState, ErrorState, LoadingState, RecipeGridSkeleton } from '../../components/ui/States';
import {
  Diet, DIET_LABELS, recipeDiets, normalizeDifficulty, TimeBucket, TIME_LABELS, timeBucket,
} from '../../utils/recipeFacts';
import '../../styles/shared-layout.css';
import '../../styles/browse.css';

interface BrowseRecipe extends RecipeCardRecipe {
  ingredients?: string[];
}

const PAGE_SIZE = 24;
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const DIETS = Object.keys(DIET_LABELS) as Diet[];
const TIMES = Object.keys(TIME_LABELS) as TimeBucket[];

const matchesQuery = (recipe: BrowseRecipe, query: string) => {
  const needle = query.toLowerCase();
  return [recipe.recipe_name, recipe.title, recipe.cuisine, ...(recipe.tags || []), ...(recipe.ingredients || [])]
    .some(field => typeof field === 'string' && field.toLowerCase().includes(needle));
};

// All recipes (design.md 5.3): search, filter bar, result count, card grid, Load more.
// Every filter lives in the URL so a filtered list can be shared or bookmarked.
const AllRecipesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim();
  const cuisine = searchParams.get('cuisine') || '';
  const diet = searchParams.get('diet') || '';
  const difficulty = searchParams.get('difficulty') || '';
  const time = searchParams.get('time') || '';

  const [recipes, setRecipes] = useState<BrowseRecipe[]>([]);
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [searchText, setSearchText] = useState(query);
  const [shown, setShown] = useState(PAGE_SIZE);

  const load = useCallback(async () => {
    setState('loading');
    try {
      setRecipes(await getAllRecipes());
      setState('ready');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setSearchText(query); }, [query]);
  useEffect(() => { setShown(PAGE_SIZE); }, [query, cuisine, diet, difficulty, time]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const toggleParam = (key: string, value: string, current: string) => setParam(key, current === value ? '' : value);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setParam('q', searchText.trim());
  };

  const clearAll = () => {
    setSearchText('');
    setSearchParams({}, { replace: true });
  };

  // Only offer a chip when at least one recipe has it (design.md 4.2)
  const options = useMemo(() => {
    const cuisineCounts = new Map<string, number>();
    const diets = new Set<Diet>();
    const difficulties = new Set<string>();
    const times = new Set<TimeBucket>();
    recipes.forEach(recipe => {
      if (recipe.cuisine) cuisineCounts.set(recipe.cuisine, (cuisineCounts.get(recipe.cuisine) || 0) + 1);
      recipeDiets(recipe).forEach(d => diets.add(d));
      const level = normalizeDifficulty(recipe.difficulty);
      if (level) difficulties.add(level);
      const bucket = timeBucket(recipe);
      if (bucket) times.add(bucket);
    });
    return {
      cuisines: [...cuisineCounts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name),
      diets: DIETS.filter(d => diets.has(d)),
      difficulties: DIFFICULTIES.filter(d => difficulties.has(d)),
      times: TIMES.filter(t => times.has(t)),
    };
  }, [recipes]);

  const results = useMemo(() => recipes.filter(recipe =>
    (!query || matchesQuery(recipe, query)) &&
    (!cuisine || recipe.cuisine === cuisine) &&
    (!diet || recipeDiets(recipe).includes(diet as Diet)) &&
    (!difficulty || normalizeDifficulty(recipe.difficulty) === difficulty) &&
    (!time || timeBucket(recipe) === time)
  ), [recipes, query, cuisine, diet, difficulty, time]);

  const activeFilters = [cuisine, diet, difficulty, time].filter(Boolean).length + (query ? 1 : 0);

  const chip = (key: string, value: string, label: string, current: string) => (
    <button
      key={value}
      type="button"
      className="chip"
      aria-pressed={current === value}
      onClick={() => toggleParam(key, value, current)}
    >
      {current === value && <i className="bi bi-check" aria-hidden="true"></i>}
      {label}
    </button>
  );

  return (
    <div className="browse">
      <div className="browse__inner">
        <Link to="/" className="btn btn--ghost btn--sm browse__back">
          <i className="bi bi-arrow-left" aria-hidden="true"></i>
          Home
        </Link>
        <header className="browse__header">
          <h1 className="browse__title">All recipes</h1>
          <p className="browse__lead">Dishes from around the world, each with the story behind it.</p>
        </header>

        <form className="browse__search" role="search" onSubmit={submitSearch}>
          <i className="bi bi-search browse__search-icon" aria-hidden="true"></i>
          <label htmlFor="browse-search" className="visually-hidden">Search recipes</label>
          <input
            id="browse-search"
            type="search"
            className="browse__search-input"
            placeholder="Search a dish, ingredient or cuisine"
            value={searchText}
            onChange={event => setSearchText(event.target.value)}
          />
          <button type="submit" className="btn btn--primary browse__search-button">Search</button>
        </form>

        {state !== 'error' && (
          <div className="browse__filters" aria-label="Filters">
            {options.cuisines.length > 0 && (
              <div className="browse__filter-row" role="group" aria-label="Cuisine">
                <span className="browse__filter-label">Cuisine</span>
                <div className="browse__chips">
                  <button type="button" className="chip" aria-pressed={!cuisine} onClick={() => setParam('cuisine', '')}>
                    {!cuisine && <i className="bi bi-check" aria-hidden="true"></i>}
                    All
                  </button>
                  {options.cuisines.map(name => chip('cuisine', name, name, cuisine))}
                </div>
              </div>
            )}
            {options.diets.length > 0 && (
              <div className="browse__filter-row" role="group" aria-label="Diet">
                <span className="browse__filter-label">Diet</span>
                <div className="browse__chips">
                  {options.diets.map(d => chip('diet', d, DIET_LABELS[d], diet))}
                </div>
              </div>
            )}
            {options.difficulties.length > 0 && (
              <div className="browse__filter-row" role="group" aria-label="Difficulty">
                <span className="browse__filter-label">Difficulty</span>
                <div className="browse__chips">
                  {options.difficulties.map(d => chip('difficulty', d, d, difficulty))}
                </div>
              </div>
            )}
            {options.times.length > 0 && (
              <div className="browse__filter-row" role="group" aria-label="Total time">
                <span className="browse__filter-label">Time</span>
                <div className="browse__chips">
                  {options.times.map(t => chip('time', t, TIME_LABELS[t], time))}
                </div>
              </div>
            )}
          </div>
        )}

        {state === 'ready' && (
          <div className="browse__count-row">
            <p className="browse__count" aria-live="polite">
              {results.length} {results.length === 1 ? 'recipe' : 'recipes'}
              {query && <> for &ldquo;{query}&rdquo;</>}
            </p>
            {activeFilters > 0 && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={clearAll}>
                Clear all
              </button>
            )}
          </div>
        )}

        {state === 'loading' && (
          <LoadingState label="Loading recipes">
            <RecipeGridSkeleton />
          </LoadingState>
        )}

        {state === 'error' && <ErrorState onRetry={load} exit={{ label: 'Back to home', to: '/' }} />}

        {state === 'ready' && results.length === 0 && (
          query ? (
            <EmptyState
              icon="bi-search"
              title={`Nothing found for "${query}"`}
              body="Check the spelling, try a dish name, or clear the filters."
              action={{ label: 'Clear search', onClick: clearAll, variant: 'ghost' }}
            />
          ) : (
            <EmptyState
              icon="bi-funnel"
              title="No recipes match these filters"
              body="Try removing a filter."
              action={{ label: 'Clear filters', onClick: clearAll, variant: 'ghost' }}
            />
          )
        )}

        {state === 'ready' && results.length > 0 && (
          <>
            <div className="recipe-page-grid">
              {results.slice(0, shown).map(recipe => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
            {shown < results.length && (
              <div className="browse__more">
                <button type="button" className="btn btn--secondary" onClick={() => setShown(n => n + PAGE_SIZE)}>
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllRecipesPage;
