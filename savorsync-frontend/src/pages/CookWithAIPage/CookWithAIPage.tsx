import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { generateRecipe, saveGeneratedRecipe, GeneratedRecipe } from '../../services/apiGenerator';
import { InlineError, Skeleton } from '../../components/ui/States';
import { totalMinutes, formatMinutes } from '../../utils/recipeFacts';
import './CookWithAIPage.css';

const SUGGESTIONS = ['eggs', 'rice', 'spinach', 'garlic', 'tomatoes', 'chicken', 'chickpeas', 'onion', 'tofu', 'potatoes'];
const CUISINES = ['Any', 'Chinese', 'Indian', 'Italian', 'Japanese', 'Korean', 'Mexican', 'Thai', 'Mediterranean', 'American'];
const DIETS = [
  { value: '', label: 'No limits' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-free' },
];
const TIMES = [
  { value: 0, label: 'Any time' },
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
];

type Status = 'idle' | 'loading' | 'error' | 'ready';

// Cook with what I have (README "AI recipe generation"): list your ingredients,
// get a recipe in SavorSync's format, and save it to your recipes.
// The signed-out preview: a short, hand-checked sample, always labeled "Example"
const SAMPLE = {
  from: ['eggs', 'leftover rice', 'spring onions'],
  cuisine: 'Chinese',
  recipe_name: 'Egg fried rice',
  subtitle: 'Day-old rice, eggs and spring onions tossed in a hot pan',
  time: '15 min',
  servings: 2,
  difficulty: 'Easy',
  ingredients: ['2 cups cooked rice, cold', '2 eggs, beaten', '3 spring onions, sliced', '1 tbsp soy sauce'],
  steps: [
    'Heat oil in a wok or large pan until shimmering.',
    'Scramble the eggs until just set, then push them to one side.',
    'Add the rice and stir-fry until hot and lightly toasted.',
    'Toss in the soy sauce and spring onions and serve.',
  ],
};

const CookWithAIPage: React.FC = () => {
  const { isAuthenticated } = useUser();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [draftText, setDraftText] = useState('');
  const [cuisine, setCuisine] = useState('Any');
  const [diet, setDiet] = useState('');
  const [maxMinutes, setMaxMinutes] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [recipe, setRecipe] = useState<GeneratedRecipe | null>(null);
  const [saving, setSaving] = useState(false);

  const addIngredients = (text: string) => {
    const items = text.split(',').map(item => item.trim().toLowerCase()).filter(Boolean);
    if (!items.length) return;
    setIngredients(prev => [...prev, ...items.filter(item => !prev.includes(item))].slice(0, 20));
    setDraftText('');
  };

  const removeIngredient = (item: string) => setIngredients(prev => prev.filter(i => i !== item));

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addIngredients(draftText);
    } else if (event.key === 'Backspace' && !draftText && ingredients.length) {
      setIngredients(prev => prev.slice(0, -1));
    }
  };

  const submit = async (event?: React.SyntheticEvent) => {
    event?.preventDefault();
    const all = draftText.trim() ? [...ingredients, ...draftText.split(',').map(i => i.trim().toLowerCase()).filter(Boolean)] : ingredients;
    if (draftText.trim()) addIngredients(draftText);
    if (all.length < 2) {
      setErrorMessage('Add at least two ingredients you have.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setRecipe(null);
    try {
      const result = await generateRecipe({
        ingredients: all,
        cuisine: cuisine === 'Any' ? undefined : cuisine,
        diet: diet || undefined,
        maxMinutes: maxMinutes || undefined,
      });
      setRecipe(result);
      setStatus('ready');
    } catch (err) {
      setErrorMessage((err as Error).message);
      setStatus('error');
    }
  };

  const save = async () => {
    if (!recipe) return;
    setSaving(true);
    try {
      const saved = await saveGeneratedRecipe(recipe._id);
      showToast(`Saved ${saved.recipe_name} to your recipes`, 'success');
      navigate(`/recipe/${saved._id}`);
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="ai-cook">
        <div className="ai-cook__inner">
          <div className="ai-cook__layout ai-cook__layout--preview">
            <div className="ai-cook__signin">
              <span className="ai-cook__signin-icon" aria-hidden="true"><i className="bi bi-stars"></i></span>
              <h1 className="ai-cook__title">Cook with what you have</h1>
              <p className="ai-cook__lead">Tell us what's in your kitchen and AI writes a recipe around it, with its story. Sign in to start.</p>
              <Link to="/login" state={{ from: '/cook-with-ai' }} className="btn btn--primary">Sign in to start</Link>
              <Link to="/register" className="btn btn--ghost">Create an account</Link>
            </div>

            {/* A fixed sample so visitors can see what they'd get before signing in. No API call. */}
            <article className="ai-cook__card ai-cook__card--example" aria-labelledby="ai-example-title">
              <div className="ai-cook__example-head">
                <span className="badge ai-cook__example-badge">Example</span>
                <p className="ai-cook__example-input">
                  From: {SAMPLE.from.join(', ')}
                </p>
              </div>
              <p className="ai-cook__overline">{SAMPLE.cuisine}</p>
              <h2 className="ai-cook__recipe-title" id="ai-example-title">{SAMPLE.recipe_name}</h2>
              <p className="ai-cook__subtitle">{SAMPLE.subtitle}</p>
              <ul className="ai-cook__facts">
                <li><i className="bi bi-clock" aria-hidden="true"></i>{SAMPLE.time}</li>
                <li><i className="bi bi-people" aria-hidden="true"></i>{SAMPLE.servings} servings</li>
                <li><i className="bi bi-bar-chart" aria-hidden="true"></i>{SAMPLE.difficulty}</li>
              </ul>
              <h3 className="ai-cook__section">Ingredients</h3>
              <ul className="ai-cook__ingredients">
                {SAMPLE.ingredients.map(item => <li key={item}>{item}</li>)}
              </ul>
              <h3 className="ai-cook__section">Steps</h3>
              <ol className="ai-cook__steps">
                {SAMPLE.steps.map(step => <li key={step}>{step}</li>)}
              </ol>
              <p className="ai-cook__disclaimer">A sample to show the format. Yours is written from the ingredients you list.</p>
            </article>
          </div>
        </div>
      </div>
    );
  }

  const minutes = recipe ? totalMinutes(recipe) : null;

  return (
    <div className="ai-cook">
      <div className="ai-cook__inner">
        <header className="ai-cook__header">
          <p className="ai-cook__overline"><i className="bi bi-stars" aria-hidden="true"></i>AI recipe</p>
          <h1 className="ai-cook__title">Cook with what you have</h1>
          <p className="ai-cook__lead">List what's in your kitchen. We'll write a recipe around it, with its story.</p>
        </header>

        <div className="ai-cook__layout">
          <form className="ai-cook__form" onSubmit={submit} aria-describedby="ai-cook-help">
            <label htmlFor="ai-ingredient" className="ai-cook__label">Your ingredients</label>
            <div className="ai-cook__tokens" onClick={() => document.getElementById('ai-ingredient')?.focus()}>
              {ingredients.map(item => (
                <span key={item} className="ai-cook__token">
                  {item}
                  <button type="button" className="ai-cook__token-remove" aria-label={`Remove ${item}`} onClick={() => removeIngredient(item)}>
                    <i className="bi bi-x" aria-hidden="true"></i>
                  </button>
                </span>
              ))}
              <input
                id="ai-ingredient"
                className="ai-cook__token-input"
                value={draftText}
                onChange={event => setDraftText(event.target.value)}
                onKeyDown={onKeyDown}
                onBlur={() => addIngredients(draftText)}
                placeholder={ingredients.length ? 'Add another' : 'e.g. eggs, rice, spinach'}
                autoComplete="off"
              />
            </div>
            <p id="ai-cook-help" className="ai-cook__help">Press Enter or a comma after each one. Salt, pepper, oil and water are assumed.</p>

            <div className="ai-cook__suggestions" aria-label="Quick add">
              {SUGGESTIONS.filter(item => !ingredients.includes(item)).slice(0, 6).map(item => (
                <button key={item} type="button" className="chip" onClick={() => addIngredients(item)}>
                  <i className="bi bi-plus" aria-hidden="true"></i>{item}
                </button>
              ))}
            </div>

            <div className="ai-cook__options">
              <label className="ai-cook__field">
                <span className="ai-cook__label">Cuisine</span>
                <select className="ai-cook__select" value={cuisine} onChange={event => setCuisine(event.target.value)}>
                  {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="ai-cook__field">
                <span className="ai-cook__label">Diet</span>
                <select className="ai-cook__select" value={diet} onChange={event => setDiet(event.target.value)}>
                  {DIETS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </label>
              <label className="ai-cook__field">
                <span className="ai-cook__label">Time</span>
                <select className="ai-cook__select" value={maxMinutes} onChange={event => setMaxMinutes(Number(event.target.value))}>
                  {TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </label>
            </div>

            <button type="submit" className="btn btn--primary btn--lg ai-cook__submit" disabled={status === 'loading'}>
              <i className="bi bi-stars" aria-hidden="true"></i>
              {status === 'loading' ? 'Writing your recipe…' : 'Create my recipe'}
            </button>
          </form>

          <section className="ai-cook__result" aria-live="polite" aria-busy={status === 'loading'}>
            {status === 'idle' && (
              <div className="ai-cook__placeholder">
                <span className="ai-cook__placeholder-icon" aria-hidden="true"><i className="bi bi-egg-fried"></i></span>
                <h2 className="ai-cook__placeholder-title">Your recipe appears here</h2>
                <p>Add a few ingredients and press Create my recipe.</p>
              </div>
            )}

            {status === 'loading' && (
              <div className="ai-cook__card" aria-hidden="true">
                <Skeleton width="40%" />
                <Skeleton width="75%" height="32px" />
                <Skeleton width="60%" />
                <Skeleton variant="image" />
              </div>
            )}

            {status === 'error' && <InlineError message={errorMessage} />}

            {status === 'ready' && recipe && (
              <article className="ai-cook__card">
                <p className="ai-cook__overline">{recipe.cuisine}</p>
                <h2 className="ai-cook__recipe-title">{recipe.recipe_name}</h2>
                {recipe.subtitle && <p className="ai-cook__subtitle">{recipe.subtitle}</p>}
                <ul className="ai-cook__facts">
                  {minutes !== null && <li><i className="bi bi-clock" aria-hidden="true"></i>{formatMinutes(minutes)}</li>}
                  {recipe.servings && <li><i className="bi bi-people" aria-hidden="true"></i>{recipe.servings} servings</li>}
                  {recipe.difficulty && <li><i className="bi bi-bar-chart" aria-hidden="true"></i>{recipe.difficulty}</li>}
                </ul>
                {recipe.culturalBackground && (
                  <div className="ai-cook__story">
                    <p className="ai-cook__story-label"><i className="bi bi-globe2" aria-hidden="true"></i>The story</p>
                    <p>{recipe.culturalBackground}</p>
                  </div>
                )}
                <h3 className="ai-cook__section">Ingredients</h3>
                <ul className="ai-cook__ingredients">
                  {recipe.ingredients.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
                <h3 className="ai-cook__section">Steps</h3>
                <ol className="ai-cook__steps">
                  {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
                <p className="ai-cook__disclaimer">AI-written. Check allergens and cooking times as you go.</p>
                <div className="ai-cook__actions">
                  <button type="button" className="btn btn--primary" onClick={save} disabled={saving}>
                    <i className="bi bi-bookmark-heart" aria-hidden="true"></i>
                    {saving ? 'Saving…' : 'Save and open'}
                  </button>
                  <button type="button" className="btn btn--secondary" onClick={submit}>
                    <i className="bi bi-arrow-repeat" aria-hidden="true"></i>
                    Try another
                  </button>
                </div>
              </article>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookWithAIPage;
