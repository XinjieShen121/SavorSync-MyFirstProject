import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Dialog, Drawer, Popover, useMediaQuery } from '@mui/material';
import { getRecipeById } from '../../services/apiRecipe';
import { getCulturalInsight } from '../../services/apiCultural';
import CulturalMusic from '../../components/CulturalMusic';
import './RecipeDetailPage.css';

type Diet = 'vegetarian' | 'gluten-free' | 'low-sodium';

interface SwapOption {
  name: string;
  diet?: Diet;
  reason?: string;
  // Text in the original ingredient and in the steps that this swap replaces
  matchKey: string;
}

interface Recipe {
  _id: string;
  recipe_name?: string;
  title?: string;
  subtitle?: string;
  cuisine?: string;
  image?: string;
  image_url?: string;
  prep_time?: string;
  cook_time?: string;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  difficulty?: string;
  culturalBackground?: string;
  cultural_background?: string;
  fun_facts?: string[];
  ingredients?: string[];
  instructions?: string[];
  substitutions?: { original?: string; substitute?: string; reason?: string }[];
  shortform_video_url?: string;
  longform_video_url?: string;
}

const errorMessage = (err: unknown, fallback: string) => (err instanceof Error && err.message) || fallback;

const DIET_LABELS: Record<Diet, string> = {
  vegetarian: 'Vegetarian',
  'gluten-free': 'Gluten-free',
  'low-sodium': 'Low-sodium',
};

// Fallback swaps for common ingredients, used when the recipe has no substitutions of its own
const COMMON_SWAPS: Record<string, Partial<Record<Diet, string>>> = {
  'chicken breast': { vegetarian: 'tofu or tempeh' },
  'soy sauce': { 'gluten-free': 'tamari or coconut aminos', 'low-sodium': 'low-sodium soy sauce' },
  flour: { 'gluten-free': 'almond or coconut flour' },
  beef: { vegetarian: 'lentils or mushrooms' },
  pork: { vegetarian: 'jackfruit or seitan' },
};

const MEASUREMENT = /^([\d/\s.]+(?:\s*(?:cup|tbsp|tsp|oz|g|kg|ml|l|pound|lb|slice|clove|bunch|handful|pinch|dash|teaspoon|tablespoon|ounce|gram|kilogram|milliliter|liter|pounds?|ounces?|grams?|kilograms?|milliliters?|liters?|cups?|tablespoons?|teaspoons?|slices?|cloves?|bunches?|handfuls?|pinches?|dashes?)\b)?)\s*(.+)$/i;

const parseIngredient = (text: string) => {
  if (text.includes(' | ')) {
    const [name, quantity] = text.split(' | ');
    return { name: name?.trim() || '', quantity: quantity?.trim() || '' };
  }
  const match = text.match(MEASUREMENT);
  if (match && match[1]?.trim()) return { quantity: match[1].trim(), name: match[2]?.trim() || text };
  return { name: text, quantity: '' };
};

const toEmbedUrl = (url?: string): string => {
  if (!url || url.includes('example')) return '';
  if (url.includes('youtube.com/embed')) return url;
  const id = url.includes('youtu.be/')
    ? url.split('youtu.be/')[1]?.split('?')[0]
    : url.includes('youtube.com/watch')
      ? url.split('v=')[1]?.split('&')[0]
      : url.includes('youtube.com/v/')
        ? url.split('youtube.com/v/')[1]?.split('?')[0]
        : '';
  return id ? `https://www.youtube.com/embed/${id}` : '';
};

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const RecipeDetailPage: React.FC = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const isMobile = useMediaQuery('(max-width: 599px)');

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [storyOpen, setStoryOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [swaps, setSwaps] = useState<Record<number, SwapOption>>({});
  const [activeDiet, setActiveDiet] = useState<Diet | null>(null);
  const [swapTarget, setSwapTarget] = useState<{ index: number; anchor: HTMLElement } | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  const stepsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!recipeId) {
        setError('No recipe ID provided');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await getRecipeById(recipeId);
        if (data._id !== recipeId) {
          setError('Recipe ID mismatch - wrong recipe loaded');
          return;
        }
        setRecipe(data);
      } catch (err) {
        setError(errorMessage(err, 'Failed to fetch recipe'));
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [recipeId]);

  const ingredients: string[] = recipe?.ingredients || [];
  const instructions: string[] = recipe?.instructions || [];
  const funFacts: string[] = recipe?.fun_facts || [];

  // Swap options per ingredient: the recipe's own substitutions first, then common swaps
  const swapOptions = useMemo(() => {
    const own = recipe?.substitutions || [];
    return ingredients.map((ingredient) => {
      const lower = ingredient.toLowerCase();
      const options: SwapOption[] = [];
      own.forEach((sub) => {
        if (sub.original && sub.substitute && lower.includes(sub.original.toLowerCase())) {
          options.push({ name: sub.substitute, reason: sub.reason, matchKey: sub.original });
        }
      });
      Object.entries(COMMON_SWAPS).forEach(([key, byDiet]) => {
        if (!lower.includes(key)) return;
        (Object.entries(byDiet) as [Diet, string][]).forEach(([diet, name]) => {
          options.push({ name, diet, matchKey: key });
        });
      });
      return options.slice(0, 3);
    });
  }, [recipe]); // eslint-disable-line react-hooks/exhaustive-deps

  const availableDiets = (Object.keys(DIET_LABELS) as Diet[]).filter((diet) =>
    swapOptions.some((options) => options.some((o) => o.diet === diet)),
  );

  const applyDiet = (diet: Diet | null) => {
    setActiveDiet(diet);
    if (!diet) {
      setSwaps({});
      return;
    }
    const next: Record<number, SwapOption> = {};
    swapOptions.forEach((options, index) => {
      const option = options.find((o) => o.diet === diet);
      if (option) next[index] = option;
    });
    setSwaps(next);
  };

  const applySwap = (index: number, option: SwapOption) => {
    setSwaps((prev) => ({ ...prev, [index]: option }));
    setSwapTarget(null);
  };

  const revertSwap = (index: number) => {
    setSwaps((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const askAboutDish = async () => {
    if (!recipeId) return;
    setInsightLoading(true);
    setInsightError(null);
    try {
      const response = await getCulturalInsight(recipeId);
      setInsight(response.insight);
    } catch (err) {
      setInsightError(errorMessage(err, "Couldn't get an answer. Try again."));
    } finally {
      setInsightLoading(false);
    }
  };

  const shareRecipe = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: recipe?.recipe_name || recipe?.title, url }).catch(() => {});
    } else {
      await navigator.clipboard?.writeText(url);
    }
  };

  const startCooking = () => {
    stepsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Show swapped ingredients inside step text in herb green, with the original on hover
  const renderStepText = (text: string) => {
    // Match the full ingredient name first ("pork belly"), then the swap key ("pork")
    const active = Object.entries(swaps).flatMap(([index, swap]) => {
      const fullName = parseIngredient(ingredients[Number(index)]).name;
      return [fullName, swap.matchKey].filter(Boolean).map((key) => ({ key, name: swap.name }));
    });
    if (!active.length) return text;
    active.sort((a, b) => b.key.length - a.key.length);
    const pattern = new RegExp(`(${active.map((s) => escapeRegExp(s.key)).join('|')})`, 'gi');
    return text.split(pattern).map((part, i) => {
      const swap = active.find((s) => s.key.toLowerCase() === part.toLowerCase());
      return swap ? (
        <span key={i} className="step-swap" title={`Original: ${part}`}>
          {swap.name}
        </span>
      ) : (
        part
      );
    });
  };

  if (loading) {
    return (
      <div className="recipe-detail-page">
        <div className="recipe-detail-container">
          <div className="loading">Loading recipe...</div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="recipe-detail-page">
        <div className="recipe-detail-container">
          <Link to="/all-recipes" className="btn btn--ghost recipe-back">
            <i className="bi bi-arrow-left" aria-hidden="true"></i>
            Recipes
          </Link>
          <h2>{error ? 'Error loading recipe' : 'Recipe not found'}</h2>
          <p>{error || "The recipe you're looking for doesn't exist."}</p>
        </div>
      </div>
    );
  }

  const title = recipe.recipe_name || recipe.title;
  const imageSrc = recipe.image_url || (recipe.image && !recipe.image.startsWith('/api/placeholder') ? recipe.image : '');
  const story: string | undefined = recipe.culturalBackground || recipe.cultural_background || funFacts[0];
  const storyIsFirstFact = !recipe.culturalBackground && !recipe.cultural_background && !!funFacts[0];
  const shortVideo = toEmbedUrl(recipe.shortform_video_url);
  const longVideo = toEmbedUrl(recipe.longform_video_url);
  const prep = recipe.prep_time || recipe.prepTime;
  const cook = recipe.cook_time || recipe.cookTime;
  const swapCount = Object.keys(swaps).length;
  const target = swapTarget ? swapOptions[swapTarget.index] : [];

  const swapPanel = swapTarget && (
    <div className="swap-panel" role="dialog" aria-label={`Swaps for ${parseIngredient(ingredients[swapTarget.index]).name}`}>
      <ul className="swap-options">
        {target.map((option, i) => (
          <li key={i} className="swap-option">
            <div className="swap-option__text">
              <span className="swap-option__name">{option.name}</span>
              {option.diet && <span className="badge badge--diet">{DIET_LABELS[option.diet]}</span>}
              {option.reason && <p className="swap-option__reason">{option.reason}</p>}
            </div>
            <button type="button" className="btn btn--primary btn--sm" onClick={() => applySwap(swapTarget.index, option)}>
              Use this
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="recipe-detail-page">
      <div className="recipe-detail-container">
        <Link to="/all-recipes" className="btn btn--ghost recipe-back">
          <i className="bi bi-arrow-left" aria-hidden="true"></i>
          Recipes
        </Link>

        {/* 1. Hero */}
        <div className="recipe-hero">
          {imageSrc && !imageFailed ? (
            <img src={imageSrc} alt={title} onError={() => setImageFailed(true)} />
          ) : (
            <div className="recipe-hero__fallback" aria-hidden="true">
              <i className="bi bi-image"></i>
            </div>
          )}
          {recipe.cuisine && <span className="badge badge--cuisine recipe-hero__badge">{recipe.cuisine}</span>}
        </div>

        {/* 2. Header */}
        <header className="recipe-header">
          <h1 className="recipe-title">{title}</h1>
          {recipe.subtitle && <p className="recipe-subtitle">{recipe.subtitle}</p>}
          <ul className="recipe-facts">
            {prep && (
              <li><i className="bi bi-clock" aria-hidden="true"></i>Prep {prep}</li>
            )}
            {cook && (
              <li><i className="bi bi-fire" aria-hidden="true"></i>Cook {cook}</li>
            )}
            {recipe.servings && (
              <li><i className="bi bi-people" aria-hidden="true"></i>{recipe.servings} servings</li>
            )}
            {recipe.difficulty && (
              <li><i className="bi bi-bar-chart" aria-hidden="true"></i>{recipe.difficulty}</li>
            )}
          </ul>
          <div className="recipe-actions">
            <button type="button" className="btn btn--icon" aria-label="Share recipe" onClick={shareRecipe}>
              <i className="bi bi-share" aria-hidden="true"></i>
            </button>
            <button type="button" className="btn btn--icon" aria-label="Print recipe" onClick={() => window.print()}>
              <i className="bi bi-printer" aria-hidden="true"></i>
            </button>
          </div>
        </header>

        {/* 3. Cultural story card (4.4) */}
        {story && (
          <section className="story-card" aria-labelledby="story-title">
            <p className="story-card__overline" id="story-title">
              <i className="bi bi-globe2" aria-hidden="true"></i>The story
            </p>
            <p className={`story-card__body ${storyOpen ? 'is-open' : ''}`} id="story-body">
              {story}
            </p>
            <div className="story-card__actions">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                aria-expanded={storyOpen}
                aria-controls="story-body"
                onClick={() => setStoryOpen((open) => !open)}
              >
                {storyOpen ? 'Show less' : 'Read the story'}
              </button>
              {shortVideo && (
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setVideoOpen(true)}>
                  <i className="bi bi-play-circle" aria-hidden="true"></i>Watch
                </button>
              )}
            </div>

            {storyOpen && (
              <div className="story-card__ai">
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={askAboutDish}
                  disabled={insightLoading}
                  aria-busy={insightLoading}
                >
                  <i className="bi bi-stars" aria-hidden="true"></i>
                  {insightLoading ? 'Asking…' : 'Ask about this dish'}
                </button>
                {insight && (
                  <div className="story-card__answer">
                    <p>{insight}</p>
                    <span className="story-card__ai-label">AI-generated</span>
                  </div>
                )}
                {insightError && (
                  <p className="story-card__error" role="alert">
                    {insightError}{' '}
                    <button type="button" className="btn btn--ghost btn--sm" onClick={askAboutDish}>Try again</button>
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {/* 4. Ingredients and steps */}
        <div className="recipe-columns">
          <section className="ingredients" aria-labelledby="ingredients-title">
            <h2 id="ingredients-title" className="recipe-section-title">Ingredients</h2>

            {availableDiets.length > 0 && (
              <div className="diet-selector">
                <div className="diet-selector__chips" role="group" aria-label="Diet">
                  <button type="button" className="chip" aria-pressed={activeDiet === null} onClick={() => applyDiet(null)}>
                    {activeDiet === null && <i className="bi bi-check" aria-hidden="true"></i>}Original
                  </button>
                  {availableDiets.map((diet) => (
                    <button key={diet} type="button" className="chip" aria-pressed={activeDiet === diet} onClick={() => applyDiet(diet)}>
                      {activeDiet === diet && <i className="bi bi-check" aria-hidden="true"></i>}
                      {DIET_LABELS[diet]}
                    </button>
                  ))}
                </div>
                {swapCount > 0 && (
                  <p className="diet-selector__count" aria-live="polite">
                    {swapCount} {swapCount === 1 ? 'swap' : 'swaps'} applied
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => applyDiet(null)}>Undo</button>
                  </p>
                )}
              </div>
            )}

            <ul className="ingredient-list">
              {ingredients.map((ingredient, index) => {
                const original = parseIngredient(ingredient);
                const swap = swaps[index];
                const options = swapOptions[index];
                const isChecked = !!checked[index];
                return (
                  <li key={index} className={`ingredient-row ${swap ? 'is-swapped' : ''}`}>
                    <label className="ingredient-row__main">
                      <input
                        type="checkbox"
                        className="ingredient-check"
                        checked={isChecked}
                        onChange={() => setChecked((prev) => ({ ...prev, [index]: !prev[index] }))}
                      />
                      <span className="ingredient-row__qty">{original.quantity}</span>
                      <span className={`ingredient-row__name ${isChecked ? 'is-checked' : ''}`}>
                        {swap ? swap.name : original.name}
                        {swap && <span className="ingredient-row__instead"> instead of {original.name}</span>}
                      </span>
                    </label>
                    {swap && <span className="badge badge--swapped">Swapped</span>}
                    {swap ? (
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => revertSwap(index)}>
                        <i className="bi bi-arrow-counterclockwise" aria-hidden="true"></i>Revert
                      </button>
                    ) : (
                      options.length > 0 && (
                        <button
                          type="button"
                          className="btn btn--icon btn--sm swap-button"
                          aria-label={`Swap ${original.name}`}
                          onClick={(e) => setSwapTarget({ index, anchor: e.currentTarget })}
                        >
                          <i className="bi bi-arrow-left-right" aria-hidden="true"></i>
                        </button>
                      )
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="steps" aria-labelledby="steps-title" ref={stepsRef}>
            <h2 id="steps-title" className="recipe-section-title">Steps</h2>
            <ol className="step-list">
              {instructions.map((step, index) => {
                const fact = funFacts[index];
                const showFact = fact && !(index === 0 && storyIsFirstFact);
                return (
                  <li key={index} className="step">
                    <span className="step__number" aria-hidden="true">{index + 1}</span>
                    <div className="step__body">
                      <p>{renderStepText(step)}</p>
                      {showFact && (
                        <div className="tip-box">
                          <i className="bi bi-lightbulb" aria-hidden="true"></i>
                          <p>{fact}</p>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        {/* 5. More sections */}
        <section className="recipe-more" id="music" aria-labelledby="music-title">
          <h2 id="music-title" className="recipe-section-title">Cook with music</h2>
          <CulturalMusic recipe={{ ...recipe, cuisine: recipe.cuisine || "" }} />
        </section>

        {longVideo && (
          <section className="recipe-more" id="video" aria-labelledby="video-title">
            <h2 id="video-title" className="recipe-section-title">Video</h2>
            <div className="video-frame">
              <iframe src={longVideo} title={`${title} video`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </section>
        )}
      </div>

      {/* 6. Docked Start Cooking button */}
      <div className="cook-dock">
        <button type="button" className="btn btn--primary btn--lg cook-dock__button" onClick={startCooking}>
          <i className="bi bi-play-fill" aria-hidden="true"></i>Start cooking
        </button>
      </div>

      {/* Swap popover (desktop) or bottom sheet (mobile) */}
      {isMobile ? (
        <Drawer anchor="bottom" open={!!swapTarget} onClose={() => setSwapTarget(null)} PaperProps={{ className: 'swap-sheet' }}>
          {swapPanel}
        </Drawer>
      ) : (
        <Popover
          open={!!swapTarget}
          anchorEl={swapTarget?.anchor}
          onClose={() => setSwapTarget(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ className: 'swap-popover' }}
        >
          {swapPanel}
        </Popover>
      )}

      {shortVideo && (
        <Dialog open={videoOpen} onClose={() => setVideoOpen(false)} maxWidth="md" fullWidth aria-label={`${title} story video`}>
          <div className="video-frame">
            <iframe src={shortVideo} title={`${title} story video`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default RecipeDetailPage;
