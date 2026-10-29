import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Dialog, Drawer, Popover, useMediaQuery } from '@mui/material';
import { getRecipeById } from '../../services/apiRecipe';
import CulturalMusic from '../../components/CulturalMusic';
import AskAboutDish from '../../components/AskAboutDish';
import CulturalVideo from '../../components/CulturalVideo';
import { getYouTubeId } from '../../utils/youtube';
import { ErrorState, LoadingState, RecipeDetailSkeleton } from '../../components/ui/States';
import { getSubstitutions, IngredientSwaps } from '../../services/apiSubstitutions';
import CookMode from '../../components/CookMode';
import FavoriteButton from '../../components/FavoriteButton';
import RecipeReviews, { Stars } from '../../components/RecipeReviews';
import { useShoppingList } from '../../context/ShoppingListContext';
import { useToast } from '../../context/ToastContext';
import { scaleQuantity, convertQuantity, detectSystem, UnitSystem } from '../../utils/quantities';
import type { ReviewSummary } from '../../services/apiReviews';
import { savedStepKey } from '../../utils/cookMode';
import { formatMinutes, parseMinutes, totalMinutes } from '../../utils/recipeFacts';
import TypeCover from '../../components/TypeCover';
import PhotoCredit, { type ImageCredit } from '../../components/PhotoCredit';
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
  region?: string;
  image?: string;
  image_url?: string;
  image_credit?: ImageCredit;
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

const DIET_LABELS: Record<Diet, string> = {
  vegetarian: 'Vegetarian',
  'gluten-free': 'Gluten-free',
  'low-sodium': 'Low-sodium',
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

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const RecipeDetailPage: React.FC = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const isMobile = useMediaQuery('(max-width: 599px)');

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'failed' | 'missing' | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [storyOpen, setStoryOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [doneSteps, setDoneSteps] = useState<Record<number, boolean>>({});
  // Phones show one list at a time; desktop shows both side by side
  const [mobileList, setMobileList] = useState<'ingredients' | 'steps'>('ingredients');
  const [swaps, setSwaps] = useState<Record<number, SwapOption>>({});
  const [activeDiet, setActiveDiet] = useState<Diet | null>(null);
  const [swapTarget, setSwapTarget] = useState<{ index: number; anchor: HTMLElement } | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [cookStep, setCookStep] = useState<number | null>(null);
  const [savedStep, setSavedStep] = useState<number | null>(null);
  const [suggested, setSuggested] = useState<IngredientSwaps[]>([]);
  const [servings, setServings] = useState<number | null>(null);
  const [batch, setBatch] = useState(1);
  const [units, setUnits] = useState<UnitSystem | null>(null);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const { addRecipe, hasRecipe } = useShoppingList();
  const { showToast } = useToast();


  useEffect(() => {
    const fetchRecipe = async () => {
      if (!recipeId) {
        setError('missing');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await getRecipeById(recipeId);
        if (data._id !== recipeId) {
          setError('missing');
          return;
        }
        setRecipe(data);
      } catch (err) {
        const status = (err as { response?: { status?: number } }).response?.status;
        setError(status === 404 || status === 400 ? 'missing' : 'failed');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [recipeId, reloadKey]);

  const ingredients: string[] = recipe?.ingredients || [];
  const instructions: string[] = recipe?.instructions || [];
  const funFacts: string[] = recipe?.fun_facts || [];

  // Suggested swaps from the API (AI, or a checked table when AI is off).
  // If they fail to load, the recipe's own substitutions are still offered.
  useEffect(() => {
    if (!recipe?._id) return;
    let cancelled = false;
    getSubstitutions(recipe._id)
      .then((result) => {
        if (!cancelled) setSuggested(result.swaps);
      })
      .catch(() => {
        if (!cancelled) setSuggested([]);
      });
    return () => { cancelled = true; };
  }, [recipe?._id]);

  // Swap options per ingredient: the recipe's own substitutions first, then suggested swaps
  const swapOptions = useMemo(() => {
    const own = recipe?.substitutions || [];
    const suggestedByIndex = new Map(suggested.map((entry) => [entry.index, entry.options]));
    return ingredients.map((ingredient, index) => {
      const lower = ingredient.toLowerCase();
      const options: SwapOption[] = [];
      own.forEach((sub) => {
        if (sub.original && sub.substitute && lower.includes(sub.original.toLowerCase())) {
          options.push({ name: sub.substitute, reason: sub.reason, matchKey: sub.original });
        }
      });
      (suggestedByIndex.get(index) || []).forEach((option) => {
        if (options.some((o) => o.diet === option.diet || o.name.toLowerCase() === option.name.toLowerCase())) return;
        options.push(option);
      });
      return options.slice(0, 3);
    });
  }, [recipe, suggested]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const shareRecipe = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: recipe?.recipe_name || recipe?.title, url }).catch(() => {});
    } else {
      await navigator.clipboard?.writeText(url);
    }
  };

  // Ticked ingredients and steps survive a reload, per recipe (this browser only)
  const progressKey = recipeId ? `savorsync:progress:${recipeId}` : '';
  useEffect(() => {
    if (!progressKey) return;
    try {
      const saved = JSON.parse(localStorage.getItem(progressKey) || '{}');
      setChecked(saved.ingredients || {});
      setDoneSteps(saved.steps || {});
    } catch {
      setChecked({});
      setDoneSteps({});
    }
  }, [progressKey]);
  useEffect(() => {
    if (!progressKey) return;
    try {
      localStorage.setItem(progressKey, JSON.stringify({ ingredients: checked, steps: doneSteps }));
    } catch {
      // Storage can be full or blocked; progress then lasts only for this visit
    }
  }, [progressKey, checked, doneSteps]);

  // Offer "Resume at step N" when cook mode was left mid-recipe
  useEffect(() => {
    if (!recipeId || cookStep !== null) return;
    try {
      const saved = Number(localStorage.getItem(savedStepKey(recipeId)));
      setSavedStep(saved > 0 ? saved : null);
    } catch {
      setSavedStep(null);
    }
  }, [recipeId, cookStep]);

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

  // Loading, not-found and error states (design.md 4.7)
  if (loading || error || !recipe) {
    return (
      <div className="recipe-detail-page">
        <div className="recipe-detail-container">
          <Link to="/all-recipes" className="btn btn--ghost recipe-back">
            <i className="bi bi-arrow-left" aria-hidden="true"></i>
            Recipes
          </Link>
          {loading ? (
            <LoadingState label="Loading recipe">
              <RecipeDetailSkeleton />
            </LoadingState>
          ) : error === 'failed' ? (
            <ErrorState onRetry={() => setReloadKey((k) => k + 1)} exit={{ label: 'Back to recipes', to: '/all-recipes' }} />
          ) : (
            <ErrorState
              title="This recipe isn't here"
              body="It may have been removed. Browse other dishes instead."
              primary={{ label: 'Browse recipes', to: '/all-recipes', variant: 'primary' }}
            />
          )}
        </div>
      </div>
    );
  }

  const title = recipe.recipe_name || recipe.title;
  const imageSrc = recipe.image_url || (recipe.image && !recipe.image.startsWith('/api/placeholder') ? recipe.image : '');
  const story: string | undefined = recipe.culturalBackground || recipe.cultural_background || funFacts[0];
  const storyIsFirstFact = !recipe.culturalBackground && !recipe.cultural_background && !!funFacts[0];
  const hasShortVideo = !!getYouTubeId(recipe.shortform_video_url);
  const hasLongVideo = !!getYouTubeId(recipe.longform_video_url);
  // The short video opens from the story card; without a story card it goes in the Video section
  const sectionVideo = hasLongVideo
    ? { recipe_name: title, longform_video_url: recipe.longform_video_url }
    : !story && hasShortVideo
      ? { recipe_name: title, shortform_video_url: recipe.shortform_video_url }
      : null;
  const prep = recipe.prep_time || recipe.prepTime;
  const cook = recipe.cook_time || recipe.cookTime;
  const total = totalMinutes(recipe);
  // Show prep and cook in the same short format as the total; keep the recipe's own text if it can't be read
  const shortTime = (value: string) => {
    const minutes = parseMinutes(value);
    return minutes ? formatMinutes(minutes) : value;
  };
  const showPhoto = !!imageSrc && !imageFailed;
  const kicker = [recipe.cuisine, recipe.region].filter(Boolean).join(' · ');
  // Fun facts are context, not cooking instructions, so they sit together beside the steps
  const goodToKnow = storyIsFirstFact ? funFacts.slice(1) : funFacts;
  const swapCount = Object.keys(swaps).length;
  const stepsDone = instructions.filter((_, index) => doneSteps[index]).length;
  const ingredientsReady = ingredients.filter((_, index) => checked[index]).length;
  const nextStep = instructions.findIndex((_, index) => !doneSteps[index]);
  const hasProgress = stepsDone > 0 || ingredientsReady > 0;
  const resetProgress = () => {
    setChecked({});
    setDoneSteps({});
  };
  // One label and target for every "start cooking" button on the page
  const cookFrom = savedStep !== null && savedStep < instructions.length
    ? savedStep
    : stepsDone > 0 && nextStep >= 0 ? nextStep : 0;
  const cookLabel = savedStep !== null && savedStep < instructions.length
    ? `Resume at step ${savedStep + 1}`
    : stepsDone > 0 && nextStep > 0 ? `Continue at step ${nextStep + 1}` : 'Start cooking';
  // Serving scaler and units: scale by servings when the recipe has them,
  // otherwise by batch size; convert units only when the cook asks for it
  const baseServings = Number(recipe.servings) > 0 ? Number(recipe.servings) : null;
  const shownServings = servings ?? baseServings;
  const factor = baseServings && shownServings ? shownServings / baseServings : batch;
  const recipeUnits = detectSystem(ingredients.map((ingredient) => parseIngredient(ingredient).quantity));
  const shownUnits = units ?? recipeUnits;
  const displayQuantity = (quantity: string) => {
    const scaled = scaleQuantity(quantity, factor);
    return shownUnits === recipeUnits ? scaled : convertQuantity(scaled, shownUnits);
  };
  const isAdjusted = factor !== 1 || shownUnits !== recipeUnits;

  const cookIngredients = ingredients.map((ingredient, index) => {
    const { name, quantity: rawQuantity } = parseIngredient(ingredient);
    const quantity = displayQuantity(rawQuantity);
    const swap = swaps[index];
    return swap ? { quantity, name: swap.name, swappedFrom: name, swapKey: swap.matchKey } : { quantity, name };
  });

  const addToShoppingList = () => {
    const label = baseServings && shownServings ? `${title} (${shownServings} servings)` : title || 'Recipe';
    addRecipe(recipe._id, label, cookIngredients.map(({ quantity, name }) => `${quantity} ${name}`.trim()));
    showToast(`Added ${cookIngredients.length} ingredients to your shopping list`, 'success');
  };
  const tips = instructions.map((_, index) => (index === 0 && storyIsFirstFact ? undefined : funFacts[index]));
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

        {/* 1. Hero: photo or type cover beside the title (design.md 4.11) */}
        <div className="recipe-intro">
          <figure className="recipe-hero">
            <div className="recipe-hero__media">
              {showPhoto ? (
                <img src={imageSrc} alt={title} onError={() => setImageFailed(true)} />
              ) : (
                // The dish name sits beside the cover, so the cover names the cuisine
                <TypeCover title={recipe.cuisine || title || 'Recipe'} kicker={recipe.region} region={recipe.region} size="hero" />
              )}
            </div>
            {showPhoto && (
              <figcaption><PhotoCredit credit={recipe.image_credit} /></figcaption>
            )}
          </figure>

          {/* 2. Header */}
          <header className="recipe-header">
            {kicker && <p className="recipe-kicker">{kicker}</p>}
            <h1 className="recipe-name">{title}</h1>
            {recipe.subtitle && <p className="recipe-deck">{recipe.subtitle}</p>}
            <ul className="recipe-facts" aria-label="Recipe facts">
              {total !== null && (
                <li className="recipe-facts__total"><i className="bi bi-clock" aria-hidden="true"></i>{formatMinutes(total)} total</li>
              )}
              {(prep || cook) && (
                <li>
                  {[prep && `Prep ${shortTime(prep)}`, cook && `Cook ${shortTime(cook)}`].filter(Boolean).join(' · ')}
                </li>
              )}
              {recipe.servings && (
                <li><i className="bi bi-people" aria-hidden="true"></i>{recipe.servings} servings</li>
              )}
              {recipe.difficulty && (
                <li><i className="bi bi-bar-chart" aria-hidden="true"></i>{recipe.difficulty}</li>
              )}
              {reviewSummary && reviewSummary.count > 0 && reviewSummary.average !== null && (
                <li>
                  <a href="#reviews" className="recipe-facts__rating">
                    <Stars value={reviewSummary.average} label={`Rated ${reviewSummary.average} out of 5`} />
                    {reviewSummary.count} {reviewSummary.count === 1 ? 'review' : 'reviews'}
                  </a>
                </li>
              )}
            </ul>
            <div className="recipe-actions">
              {instructions.length > 0 && (
                <button type="button" className="btn btn--primary recipe-actions__cook" onClick={() => setCookStep(cookFrom)}>
                  <i className="bi bi-play-fill" aria-hidden="true"></i>
                  {cookLabel}
                </button>
              )}
              <FavoriteButton recipeId={recipe._id} recipeName={title || 'this recipe'} />
              <button type="button" className="btn btn--icon" aria-label="Share recipe" onClick={shareRecipe}>
                <i className="bi bi-share" aria-hidden="true"></i>
              </button>
              <button type="button" className="btn btn--icon" aria-label="Print recipe" onClick={() => window.print()}>
                <i className="bi bi-printer" aria-hidden="true"></i>
              </button>
            </div>
          </header>
        </div>

        {/* 3. The story: a label and a short excerpt under a hairline rule (4.11) */}
        {story && (
          <section className="recipe-story" aria-labelledby="story-title">
            <h2 className="recipe-kicker recipe-story__label" id="story-title">The story</h2>
            <div className="recipe-story__text">
            <p className={`recipe-story__body ${storyOpen ? 'is-open' : ''}`} id="story-body">
              {story}
            </p>
            <div className="recipe-story__actions">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                aria-expanded={storyOpen}
                aria-controls="story-body"
                onClick={() => setStoryOpen((open) => !open)}
              >
                {storyOpen ? 'Show less' : 'Read the story and ask about it'}
              </button>
              {hasShortVideo && (
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setVideoOpen(true)}>
                  <i className="bi bi-play-circle" aria-hidden="true"></i>Watch
                </button>
              )}
            </div>

            {storyOpen && (
              <div className="recipe-story__ai">
                <AskAboutDish recipe={recipe} />
              </div>
            )}
            </div>
          </section>
        )}

        {/* 4. Ingredients and steps. On phones a switch shows one list at a time */}
        <div className="recipe-switch" role="group" aria-label="Show">
          <div className="recipe-switch__buttons">
            <button type="button" aria-pressed={mobileList === 'ingredients'} onClick={() => setMobileList('ingredients')}>
              Ingredients{ingredients.length > 0 && ` · ${ingredientsReady}/${ingredients.length}`}
            </button>
            <button type="button" aria-pressed={mobileList === 'steps'} onClick={() => setMobileList('steps')}>
              Steps{instructions.length > 0 && ` · ${stepsDone}/${instructions.length}`}
            </button>
          </div>
          <div className="recipe-switch__progress" aria-hidden="true">
            <span style={{ width: `${instructions.length ? (stepsDone / instructions.length) * 100 : 0}%` }}></span>
          </div>
        </div>

        <div className="recipe-columns">
          <section className={`ingredients ${mobileList === 'ingredients' ? '' : 'is-mobile-hidden'}`} aria-labelledby="ingredients-title">
            <div className="recipe-list-head">
              <h2 id="ingredients-title" className="recipe-section-title">Ingredients</h2>
              {ingredients.length > 0 && (
                <span className="recipe-list-head__count">{ingredientsReady} of {ingredients.length} ready</span>
              )}
            </div>

            <div className="ingredient-tools">
              {baseServings ? (
                <div className="servings-stepper" role="group" aria-label="Servings">
                  <button
                    type="button"
                    className="btn btn--icon btn--sm"
                    aria-label="Fewer servings"
                    disabled={(shownServings || 1) <= 1}
                    onClick={() => setServings(Math.max(1, (shownServings || baseServings) - 1))}
                  >
                    <i className="bi bi-dash-lg" aria-hidden="true"></i>
                  </button>
                  <span className="servings-stepper__value" aria-live="polite">
                    {shownServings} {shownServings === 1 ? 'serving' : 'servings'}
                  </span>
                  <button
                    type="button"
                    className="btn btn--icon btn--sm"
                    aria-label="More servings"
                    disabled={(shownServings || 1) >= 24}
                    onClick={() => setServings(Math.min(24, (shownServings || baseServings) + 1))}
                  >
                    <i className="bi bi-plus-lg" aria-hidden="true"></i>
                  </button>
                </div>
              ) : (
                <div className="ingredient-tools__chips" role="group" aria-label="Batch size">
                  {[0.5, 1, 2, 3].map((size) => (
                    <button key={size} type="button" className="chip" aria-pressed={batch === size} onClick={() => setBatch(size)}>
                      {size === 0.5 ? '½' : size}×
                    </button>
                  ))}
                </div>
              )}
              <div className="units-toggle" role="group" aria-label="Units">
                <button type="button" aria-pressed={shownUnits === 'metric'} onClick={() => setUnits('metric')}>Metric</button>
                <button type="button" aria-pressed={shownUnits === 'us'} onClick={() => setUnits('us')}>US</button>
              </div>
              {isAdjusted && (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => { setServings(null); setBatch(1); setUnits(null); }}
                >
                  Reset
                </button>
              )}
            </div>

            {availableDiets.length > 0 && (
              <div className="diet-selector">
                <p className="recipe-kicker recipe-kicker--muted" id="make-it-label">Make it</p>
                <div className="diet-selector__chips" role="group" aria-labelledby="make-it-label">
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
                    {swapCount} {swapCount === 1 ? 'ingredient' : 'ingredients'} swapped. The steps are updated too.
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => applyDiet(null)}>Undo all</button>
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
                      <span className="ingredient-row__qty">{displayQuantity(original.quantity)}</span>
                      <span className={`ingredient-row__name ${isChecked ? 'is-checked' : ''}`}>
                        {swap ? swap.name : original.name}
                      </span>
                    </label>
                    {!swap && options.length > 0 && (
                      <button
                        type="button"
                        className="swap-button"
                        aria-label={`Swap ${original.name}`}
                        onClick={(e) => setSwapTarget({ index, anchor: e.currentTarget })}
                      >
                        <i className="bi bi-arrow-left-right" aria-hidden="true"></i>Swap
                      </button>
                    )}
                    {swap && (
                      <p className="ingredient-row__instead">
                        {swap.diet ? `${DIET_LABELS[swap.diet]} swap, instead` : 'Instead'} of {original.name}
                        <button type="button" className="ingredient-row__undo" onClick={() => revertSwap(index)}>
                          Undo<span className="visually-hidden"> swap for {original.name}</span>
                        </button>
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>

            {ingredients.length > 0 && (
              <button type="button" className="btn btn--secondary shopping-add" onClick={addToShoppingList}>
                <i className={`bi ${hasRecipe(recipe._id) ? 'bi-basket-fill' : 'bi-basket'}`} aria-hidden="true"></i>
                {hasRecipe(recipe._id) ? 'Update shopping list' : 'Add to shopping list'}
              </button>
            )}
          </section>

          <section className={`steps ${mobileList === 'steps' ? '' : 'is-mobile-hidden'}`} aria-labelledby="steps-title">
            <div className="recipe-list-head">
              <h2 id="steps-title" className="recipe-section-title">Steps</h2>
              {hasProgress && (
                <button type="button" className="btn btn--ghost btn--sm" onClick={resetProgress}>Reset</button>
              )}
            </div>
            {instructions.length > 0 && (
              <div className="step-progress">
                <div
                  className="step-progress__bar"
                  role="progressbar"
                  aria-label="Steps done"
                  aria-valuemin={0}
                  aria-valuemax={instructions.length}
                  aria-valuenow={stepsDone}
                >
                  <span style={{ width: `${(stepsDone / instructions.length) * 100}%` }}></span>
                </div>
                <span className="step-progress__text">
                  {stepsDone === instructions.length ? 'All steps done' : `${stepsDone} of ${instructions.length} steps done`}
                </span>
              </div>
            )}
            <ol className="step-list">
              {instructions.map((step, index) => {
                const done = !!doneSteps[index];
                const current = stepsDone > 0 && index === nextStep;
                return (
                  <li key={index} className={`step ${done ? 'is-done' : ''} ${current ? 'is-current' : ''}`}>
                    <label className="step__label">
                      <input
                        type="checkbox"
                        className="step__check"
                        checked={done}
                        onChange={() => setDoneSteps((prev) => ({ ...prev, [index]: !prev[index] }))}
                      />
                      <span className="step__mark" aria-hidden="true">
                        {done && <i className="bi bi-check-lg"></i>}
                      </span>
                      <span className="step__body">
                        <span className="step__kicker">Step {index + 1}{current && ' · now'}</span>
                        <span className="step__text">{renderStepText(step)}</span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ol>

            {goodToKnow.length > 0 && (
              <aside className="recipe-know" aria-labelledby="know-title">
                <h3 className="recipe-kicker" id="know-title">Good to know</h3>
                <ul className="recipe-know__list">
                  {goodToKnow.map((fact, index) => (
                    <li key={index}>{fact}</li>
                  ))}
                </ul>
              </aside>
            )}
          </section>
        </div>

        {/* 5. More sections */}
        <section className="recipe-more" id="music" aria-labelledby="music-title">
          <h2 id="music-title" className="recipe-section-title">Cook with music</h2>
          <CulturalMusic recipe={{ ...recipe, cuisine: recipe.cuisine || "" }} />
        </section>

        {sectionVideo && (
          <section className="recipe-more" id="video" aria-labelledby="video-title">
            <h2 id="video-title" className="recipe-section-title">Video</h2>
            <CulturalVideo recipe={sectionVideo} />
          </section>
        )}

        <div className="recipe-more">
          <RecipeReviews recipeId={recipe._id} recipeName={title || 'this dish'} onSummary={setReviewSummary} />
        </div>
      </div>

      {/* 6. Docked Start Cooking button */}
      {instructions.length > 0 && cookStep === null && (
        <div className="cook-dock">
          <button type="button" className="btn btn--primary btn--lg cook-dock__button" onClick={() => setCookStep(cookFrom)}>
            <i className="bi bi-play-fill" aria-hidden="true"></i>
            {cookLabel}
          </button>
        </div>
      )}

      {cookStep !== null && recipeId && (
        <CookMode
          recipeId={recipeId}
          title={title || 'this dish'}
          steps={instructions}
          tips={tips}
          ingredients={cookIngredients}
          checked={checked}
          onToggleIngredient={(index) => setChecked((prev) => ({ ...prev, [index]: !prev[index] }))}
          startStep={cookStep}
          onClose={() => setCookStep(null)}
          heroImage={imageSrc || undefined}
          heroCredit={recipe.image_credit}
        />
      )}

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

      {hasShortVideo && (
        <Dialog open={videoOpen} onClose={() => setVideoOpen(false)} maxWidth="md" fullWidth aria-label={`${title} story video`}>
          <CulturalVideo recipe={{ recipe_name: title, shortform_video_url: recipe.shortform_video_url }} autoPlay />
        </Dialog>
      )}
    </div>
  );
};

export default RecipeDetailPage;
