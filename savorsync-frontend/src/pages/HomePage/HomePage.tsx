import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { getAllRecipes } from '../../services/apiRecipe';
import QuickStartModal from '../QuickStartPage/QuickStartModalMUI';
import './HomePage.css';

// Import images
import asianFood from "../../assets/asian-food.jpeg";
import mediterraneanFood from "../../assets/mediterranean-food.jpeg";
import latinFood from "../../assets/latin-food.jpg";
import americanFood from "../../assets/american-food.jpeg";

// One greeting line rotates under the headline (design.md 5.2)
const greetings = [
  { text: 'Hello · ¡Hola! · Bonjour', lang: 'en' },
  { text: 'नमस्ते · Namaste', lang: 'hi' },
  { text: '你好 · Nǐ hǎo', lang: 'zh' },
  { text: 'こんにちは · Konnichiwa', lang: 'ja' },
  { text: 'مرحبا · Marhaba', lang: 'ar' },
  { text: '안녕하세요 · Annyeonghaseyo', lang: 'ko' },
];

const cuisines = [
  { id: 'asian', name: 'Asian Heritage', regions: 'Japanese, Thai, Korean and more', image: asianFood },
  { id: 'mediterranean', name: 'Mediterranean', regions: 'Greek, Italian, Lebanese and more', image: mediterraneanFood },
  { id: 'latin', name: 'Latin Flavors', regions: 'Mexican, Peruvian, Cuban and more', image: latinFood },
  { id: 'american', name: 'American Comfort', regions: 'Southern, Tex-Mex, Cajun and more', image: americanFood },
];

type LoadState = 'loading' | 'error' | 'ready';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();

  const [showQuickStart, setShowQuickStart] = useState(false);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [recipesState, setRecipesState] = useState<LoadState>('loading');

  // Rotate the greeting, unless the visitor prefers reduced motion
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const interval = setInterval(() => {
      setGreetingIndex(i => (i + 1) % greetings.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadRecipes = useCallback(async () => {
    setRecipesState('loading');
    try {
      const data = await getAllRecipes();
      // Same pick as the Trending page until real ranking exists
      setRecipes(Array.isArray(data) ? data.slice(0, 3) : []);
      setRecipesState('ready');
    } catch {
      setRecipesState('error');
    }
  }, []);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    navigate(term ? `/all-recipes?q=${encodeURIComponent(term)}` : '/all-recipes');
  };

  const greeting = greetings[greetingIndex];

  return (
    <div className="home">
      <header className="home-hero">
        <div className="home-hero__inner">
          <p className="home-hero__greeting" lang={greeting.lang} aria-live="off">
            {isAuthenticated && user ? `Welcome back, ${user.name}` : greeting.text}
          </p>
          <h1 className="home-hero__title">Connecting the world, one dish at a time</h1>
          <p className="home-hero__subtitle">
            Cook recipes from around the world and learn the stories, music and people behind them.
          </p>

          <form className="home-hero__actions" role="search" onSubmit={handleSearch}>
            <label htmlFor="home-search" className="visually-hidden">Search recipes</label>
            <div className="home-search">
              <i className="bi bi-search home-search__icon" aria-hidden="true"></i>
              <input
                id="home-search"
                type="search"
                className="home-search__input"
                placeholder="Search a dish, ingredient or cuisine"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <button type="button" className="home-btn home-btn--primary" onClick={() => setShowQuickStart(true)}>
              <i className="bi bi-play-fill" aria-hidden="true"></i>
              Start cooking
            </button>
          </form>
        </div>
      </header>

      <main className="home-main">
        <section className="home-section" aria-labelledby="home-cuisines-title">
          <h2 id="home-cuisines-title" className="home-section__title">Explore by cuisine</h2>
          <div className="home-cuisines">
            {cuisines.map(cuisine => (
              <Link key={cuisine.id} to={`/cuisine/${cuisine.id}`} className="home-cuisine">
                <img src={cuisine.image} alt="" className="home-cuisine__image" />
                <span className="home-cuisine__label">
                  <span className="home-cuisine__name">{cuisine.name}</span>
                  <span className="home-cuisine__regions">{cuisine.regions}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {recipesState !== 'ready' || recipes.length > 0 ? (
          <section className="home-section home-section--last" aria-labelledby="home-trending-title">
            <div className="home-section__header">
              <h2 id="home-trending-title" className="home-section__title">Trending this week</h2>
              <Link to="/all-recipes" className="home-section__link">View all recipes</Link>
            </div>

            {recipesState === 'loading' && (
              <div className="home-recipes" aria-busy="true">
                <span className="visually-hidden">Loading recipes</span>
                {[0, 1, 2].map(i => (
                  <div key={i} className="home-recipe home-recipe--skeleton" aria-hidden="true">
                    <div className="home-recipe__media skeleton"></div>
                    <div className="home-recipe__body">
                      <div className="skeleton skeleton--line"></div>
                      <div className="skeleton skeleton--line skeleton--short"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {recipesState === 'error' && (
              <div className="home-inline-error" role="status">
                <i className="bi bi-exclamation-circle" aria-hidden="true"></i>
                <span>We couldn't load recipes. Check your connection and try again.</span>
                <button type="button" className="home-btn home-btn--ghost" onClick={loadRecipes}>Try again</button>
              </div>
            )}

            {recipesState === 'ready' && (
              <div className="home-recipes">
                {recipes.map(recipe => {
                  const name = recipe.recipe_name || recipe.title;
                  return (
                    <Link key={recipe._id} to={`/recipe/${recipe._id}`} className="home-recipe">
                      <div className="home-recipe__media">
                        {recipe.image_url || recipe.image ? (
                          <img src={recipe.image_url || recipe.image} alt={name} className="home-recipe__image" />
                        ) : (
                          <i className="bi bi-image home-recipe__placeholder" aria-hidden="true"></i>
                        )}
                        {recipe.cuisine && <span className="home-recipe__badge">{recipe.cuisine}</span>}
                      </div>
                      <div className="home-recipe__body">
                        <span className="home-recipe__name">{name}</span>
                        {recipe.difficulty && (
                          <span className="home-recipe__meta">
                            <i className="bi bi-bar-chart" aria-hidden="true"></i>
                            {recipe.difficulty}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        ) : null}
      </main>

      <footer className="home-footer">
        <div className="home-footer__inner">
          <nav className="home-footer__links" aria-label="Footer">
            <Link to="/all-recipes">Recipes</Link>
            <Link to="/community">Community</Link>
          </nav>
          <span>© {new Date().getFullYear()} SavorSync</span>
        </div>
      </footer>

      <QuickStartModal
        isOpen={showQuickStart}
        onClose={() => setShowQuickStart(false)}
      />
    </div>
  );
};

export default HomePage;
