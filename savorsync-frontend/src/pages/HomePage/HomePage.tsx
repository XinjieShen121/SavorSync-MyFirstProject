import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { getAllRecipes, getTrendingRecipes } from '../../services/apiRecipe';
import { getAllPosts } from '../../services/apiPosts';
import { hasCulturalVideo } from '../../utils/youtube';
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

const popularSearches = ['Ramen', 'Tacos', 'Curry', 'Dumplings', 'Pasta'];

const cuisines = [
  { id: 'asian', name: 'Asian Heritage', regions: 'Japanese, Thai, Korean', image: asianFood },
  { id: 'mediterranean', name: 'Mediterranean', regions: 'Greek, Italian, Lebanese', image: mediterraneanFood },
  { id: 'latin', name: 'Latin Flavors', regions: 'Mexican, Peruvian, Cuban', image: latinFood },
  { id: 'american', name: 'American Comfort', regions: 'Southern, Tex-Mex, Cajun', image: americanFood },
];

const features = [
  { icon: 'bi-stars', title: 'Ask about any dish', text: 'Ask AI where a dish comes from, why its ingredients matter and how families serve it.', to: '/all-recipes', cta: 'Find a dish' },
  { icon: 'bi-play-circle', title: 'Watch its story', text: 'Short videos take you to the kitchens and markets behind each recipe.', to: '/all-recipes', cta: 'Browse recipes' },
  { icon: 'bi-music-note-beamed', title: 'Cook with its music', text: 'Spotify playlists from the same country play while you cook.', to: '/all-recipes', cta: 'Pick a cuisine' },
  { icon: 'bi-people', title: 'Share what you made', text: 'Post your photos and twists, and see what other cooks are making.', to: '/community', cta: 'Visit the community' },
];

type LoadState = 'loading' | 'error' | 'ready';

interface HomeRecipe {
  _id: string;
  recipe_name?: string;
  title?: string;
  cuisine?: string;
  difficulty?: string;
  image?: string;
  image_url?: string;
  culturalBackground?: string;
  fun_facts?: string[];
  shortform_video_url?: string;
  longform_video_url?: string;
}

interface HomePost {
  _id: string;
  title: string;
  image?: string | null;
  author?: string;
  authorId?: { name?: string; avatar?: string } | string;
  likes?: unknown[];
  comments?: unknown[];
}

const recipeName = (recipe: HomeRecipe) => recipe.recipe_name || recipe.title || 'Untitled recipe';
const recipeImage = (recipe: HomeRecipe) => recipe.image_url || recipe.image || '';

// A different dish each day, the same one for everyone that day
const pickDishOfTheDay = (recipes: HomeRecipe[]) => {
  const withStory = recipes.filter(r => recipeImage(r) && (r.culturalBackground || r.fun_facts?.length));
  const pool = withStory.length ? withStory : recipes;
  if (!pool.length) return null;
  const dayNumber = Math.floor(Date.now() / 86400000);
  return pool[dayNumber % pool.length];
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();

  const [showQuickStart, setShowQuickStart] = useState(false);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState<HomeRecipe[]>([]);
  const [recipesState, setRecipesState] = useState<LoadState>('loading');
  const [trendingRecipes, setTrendingRecipes] = useState<HomeRecipe[] | null>(null);
  const [posts, setPosts] = useState<HomePost[]>([]);
  const [postsState, setPostsState] = useState<LoadState>('loading');

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
      // Trending is a nice-to-have here; if it fails, fall back to the full list
      const [data, trendingData] = await Promise.all([
        getAllRecipes(),
        getTrendingRecipes(4).catch(() => null),
      ]);
      setRecipes(Array.isArray(data) ? data : []);
      setTrendingRecipes(Array.isArray(trendingData) ? trendingData : null);
      setRecipesState('ready');
    } catch {
      setRecipesState('error');
    }
  }, []);

  const loadPosts = useCallback(async () => {
    setPostsState('loading');
    try {
      const response = await getAllPosts({ page: 1, limit: 3 });
      setPosts(response.data?.posts?.slice(0, 3) || []);
      setPostsState('ready');
    } catch {
      setPostsState('error');
    }
  }, []);

  useEffect(() => {
    loadRecipes();
    loadPosts();
  }, [loadRecipes, loadPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    navigate(term ? `/all-recipes?q=${encodeURIComponent(term)}` : '/all-recipes');
  };

  const greeting = greetings[greetingIndex];
  const spotlight = recipesState === 'ready' ? pickDishOfTheDay(recipes) : null;
  // Same ranking as the Trending page, minus today's dish
  const trending = (trendingRecipes || recipes).filter(r => r._id !== spotlight?._id).slice(0, 3);
  const spotlightStory = spotlight ? spotlight.culturalBackground || spotlight.fun_facts?.[0] : '';

  return (
    <div className="home">
      <header className="home-hero">
        <div className="home-hero__inner">
          <p className="home-hero__greeting" lang={greeting.lang}>
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

          <div className="home-hero__popular">
            <span className="home-hero__popular-label">Popular:</span>
            {popularSearches.map(term => (
              <Link key={term} to={`/all-recipes?q=${encodeURIComponent(term)}`} className="home-chip">
                {term}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="home-main">
        <section className="home-section" aria-labelledby="home-cuisines-title">
          <div className="home-section__header">
            <div>
              <h2 id="home-cuisines-title" className="home-section__title">Explore by cuisine</h2>
              <p className="home-section__lead">Start with a region, then find the dish that tells its story.</p>
            </div>
            <Link to="/all-recipes" className="home-section__link">All cuisines</Link>
          </div>
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

        {recipesState === 'loading' && (
          <section className="home-section" aria-busy="true">
            <span className="visually-hidden">Loading today's dish</span>
            <div className="home-spotlight" aria-hidden="true">
              <div className="home-spotlight__media skeleton"></div>
              <div className="home-spotlight__body">
                <div className="skeleton skeleton--line skeleton--short"></div>
                <div className="skeleton skeleton--title"></div>
                <div className="skeleton skeleton--line"></div>
                <div className="skeleton skeleton--line"></div>
              </div>
            </div>
          </section>
        )}

        {spotlight && (
          <section className="home-section" aria-labelledby="home-spotlight-title">
            <article className="home-spotlight">
              <Link to={`/recipe/${spotlight._id}`} className="home-spotlight__media" tabIndex={-1} aria-hidden="true">
                {recipeImage(spotlight) ? (
                  <img src={recipeImage(spotlight)} alt="" className="home-spotlight__image" />
                ) : (
                  <i className="bi bi-image home-recipe__placeholder"></i>
                )}
              </Link>
              <div className="home-spotlight__body">
                <p className="home-overline">
                  <i className="bi bi-calendar-heart" aria-hidden="true"></i>
                  Dish of the day{spotlight.cuisine ? ` · ${spotlight.cuisine}` : ''}
                </p>
                <h2 id="home-spotlight-title" className="home-spotlight__title">{recipeName(spotlight)}</h2>
                {spotlightStory && <p className="home-spotlight__story">{spotlightStory}</p>}
                <ul className="home-spotlight__features" aria-label="On this recipe">
                  <li><i className="bi bi-stars" aria-hidden="true"></i>Ask AI about it</li>
                  {hasCulturalVideo(spotlight) && <li><i className="bi bi-play-circle" aria-hidden="true"></i>Cultural video</li>}
                  <li><i className="bi bi-music-note-beamed" aria-hidden="true"></i>Music to cook to</li>
                  <li><i className="bi bi-list-ol" aria-hidden="true"></i>Step-by-step cook mode</li>
                </ul>
                <div className="home-spotlight__actions">
                  <Link to={`/recipe/${spotlight._id}`} className="home-btn home-btn--primary">
                    Cook this dish
                    <i className="bi bi-arrow-right" aria-hidden="true"></i>
                  </Link>
                </div>
              </div>
            </article>
          </section>
        )}

        {(recipesState !== 'ready' || trending.length > 0) && (
          <section className="home-section" aria-labelledby="home-trending-title">
            <div className="home-section__header">
              <div>
                <h2 id="home-trending-title" className="home-section__title">Trending this week</h2>
                <p className="home-section__lead">What cooks around the world are making right now.</p>
              </div>
              <Link to="/trending-recipes" className="home-section__link">See all trending</Link>
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
                {trending.map(recipe => (
                  <Link key={recipe._id} to={`/recipe/${recipe._id}`} className="home-recipe">
                    <div className="home-recipe__media">
                      {recipeImage(recipe) ? (
                        <img src={recipeImage(recipe)} alt={recipeName(recipe)} className="home-recipe__image" />
                      ) : (
                        <i className="bi bi-image home-recipe__placeholder" aria-hidden="true"></i>
                      )}
                      {recipe.cuisine && <span className="home-recipe__badge">{recipe.cuisine}</span>}
                    </div>
                    <div className="home-recipe__body">
                      <span className="home-recipe__name">{recipeName(recipe)}</span>
                      {recipe.difficulty && (
                        <span className="home-recipe__meta">
                          <i className="bi bi-bar-chart" aria-hidden="true"></i>
                          {recipe.difficulty}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="home-band" aria-labelledby="home-features-title">
          <div className="home-band__inner">
            <p className="home-overline home-overline--center">More than a recipe</p>
            <h2 id="home-features-title" className="home-section__title home-section__title--center">
              Every dish comes with its culture
            </h2>
            <div className="home-features">
              {features.map(feature => (
                <div key={feature.title} className="home-feature">
                  <span className="home-feature__icon" aria-hidden="true">
                    <i className={`bi ${feature.icon}`}></i>
                  </span>
                  <h3 className="home-feature__title">{feature.title}</h3>
                  <p className="home-feature__text">{feature.text}</p>
                  <Link to={feature.to} className="home-section__link">
                    {feature.cta}
                    <i className="bi bi-arrow-right" aria-hidden="true"></i>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section home-section--last" aria-labelledby="home-community-title">
          <div className="home-section__header">
            <div>
              <h2 id="home-community-title" className="home-section__title">From the community</h2>
              <p className="home-section__lead">Photos, stories and twists from cooks like you.</p>
            </div>
            <Link to="/community" className="home-section__link">Open the community</Link>
          </div>

          {postsState === 'loading' && (
            <div className="home-posts" aria-busy="true">
              <span className="visually-hidden">Loading posts</span>
              {[0, 1, 2].map(i => (
                <div key={i} className="home-post" aria-hidden="true">
                  <div className="home-post__media skeleton"></div>
                  <div className="home-post__body">
                    <div className="skeleton skeleton--line"></div>
                    <div className="skeleton skeleton--line skeleton--short"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {postsState === 'ready' && posts.length > 0 && (
            <div className="home-posts">
              {posts.map(post => {
                const authorInfo = typeof post.authorId === 'object' ? post.authorId : undefined;
                const author = authorInfo?.name || post.author;
                return (
                  <Link key={post._id} to={`/post/${post._id}`} className="home-post">
                    <div className="home-post__media">
                      {post.image ? (
                        <img src={post.image} alt="" className="home-recipe__image" />
                      ) : (
                        <i className="bi bi-chat-quote home-recipe__placeholder" aria-hidden="true"></i>
                      )}
                    </div>
                    <div className="home-post__body">
                      <span className="home-post__title">{post.title}</span>
                      <span className="home-post__meta">
                        {authorInfo?.avatar ? (
                          <img src={authorInfo.avatar} alt="" className="home-post__avatar" />
                        ) : (
                          <i className="bi bi-person-circle home-post__avatar-icon" aria-hidden="true"></i>
                        )}
                        <span className="home-post__author">{author || 'SavorSync cook'}</span>
                        <span className="home-post__stats">
                          <i className="bi bi-heart" aria-hidden="true"></i>
                          {post.likes?.length || 0}
                          <span className="visually-hidden">likes,</span>
                          <i className="bi bi-chat" aria-hidden="true"></i>
                          {post.comments?.length || 0}
                          <span className="visually-hidden">comments</span>
                        </span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {(postsState === 'error' || (postsState === 'ready' && posts.length === 0)) && (
            <div className="home-empty">
              <span className="home-empty__icon" aria-hidden="true"><i className="bi bi-chat-heart"></i></span>
              <h3 className="home-empty__title">
                {postsState === 'error' ? "We couldn't load community posts" : 'No posts yet'}
              </h3>
              <p className="home-empty__text">
                {postsState === 'error' ? 'Check your connection and try again.' : 'Share what you cooked to start the conversation.'}
              </p>
              {postsState === 'error' && (
                <button type="button" className="home-btn home-btn--ghost" onClick={loadPosts}>Try again</button>
              )}
            </div>
          )}

          <div className="home-cta">
            <div>
              <h3 className="home-cta__title">Cooked something from SavorSync?</h3>
              <p className="home-cta__text">Share a photo and the story behind your version.</p>
            </div>
            <Link to={isAuthenticated ? '/create-post' : '/login'} className="home-btn home-btn--primary">
              <i className="bi bi-camera" aria-hidden="true"></i>
              Share your dish
            </Link>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="home-footer__inner">
          <div className="home-footer__brand">
            <span className="home-footer__logo">
              <i className="bi bi-egg-fried" aria-hidden="true"></i>
              SavorSync
            </span>
            <p className="home-footer__tagline">Cook the culture. Recipes, stories and music from around the world.</p>
          </div>
          <nav className="home-footer__col" aria-label="Explore">
            <h3 className="home-footer__heading">Explore</h3>
            <Link to="/all-recipes">All recipes</Link>
            <Link to="/trending-recipes">Trending</Link>
            <Link to="/cuisine/asian">Asian</Link>
            <Link to="/cuisine/mediterranean">Mediterranean</Link>
          </nav>
          <nav className="home-footer__col" aria-label="More cuisines">
            <h3 className="home-footer__heading">Cuisines</h3>
            <Link to="/cuisine/latin">Latin</Link>
            <Link to="/cuisine/american">American</Link>
            <Link to="/cuisine/indian">Indian</Link>
            <Link to="/cuisine/italian">Italian</Link>
          </nav>
          <nav className="home-footer__col" aria-label="Community">
            <h3 className="home-footer__heading">Community</h3>
            <Link to="/community">Feed</Link>
            <Link to="/create-post">Share a dish</Link>
            <Link to={isAuthenticated ? '/profile' : '/login'}>{isAuthenticated ? 'Your profile' : 'Sign in'}</Link>
            {!isAuthenticated && <Link to="/register">Create an account</Link>}
          </nav>
        </div>
        <div className="home-footer__bottom">
          <span>© {new Date().getFullYear()} SavorSync</span>
          <span>Made with love for food and culture</span>
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
