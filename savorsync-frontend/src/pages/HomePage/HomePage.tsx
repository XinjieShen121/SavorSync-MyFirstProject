import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { getAllRecipes, getTrendingRecipes } from '../../services/apiRecipe';
import { getAllPosts } from '../../services/apiPosts';
import RecipeCard from '../../components/RecipeCard';
import TypeCover from '../../components/TypeCover';
import FavoriteButton from '../../components/FavoriteButton';
import QuickStartModal from '../QuickStartPage/QuickStartModalMUI';
import {
  totalMinutes, formatMinutes, normalizeDifficulty, recipeDiets, timeBucket,
} from '../../utils/recipeFacts';
import './HomePage.css';

// Editorial homepage concept (see the design direction write-up). Every fact on
// this page comes from recipe data; sections without data hide themselves.

type LoadState = 'loading' | 'error' | 'ready';

interface ImageCredit {
  author?: string;
  license?: string;
  license_url?: string;
  source_url?: string;
  source?: string;
}

interface HomeRecipe {
  _id: string;
  recipe_name?: string;
  title?: string;
  subtitle?: string;
  cuisine?: string;
  region?: string;
  difficulty?: string;
  servings?: number | string | null;
  prep_time?: string;
  cook_time?: string;
  prepTime?: string;
  cookTime?: string;
  image?: string;
  image_url?: string;
  image_credit?: ImageCredit;
  culturalBackground?: string;
  fun_facts?: string[];
  tags?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
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

// First one or two sentences, for decks and story teasers
const firstSentences = (text = '', count = 1) => {
  const parts = text.match(/[^.!?]+[.!?]+(\s|$)/g);
  return parts ? parts.slice(0, count).join('').trim() : text;
};

// A different dish each day, the same one for everyone that day
const dayNumber = () => Math.floor(Date.now() / 86400000);

const pickDishOfTheDay = (recipes: HomeRecipe[]) => {
  const withStory = recipes.filter(r => r.culturalBackground);
  const withPhoto = withStory.filter(r => recipeImage(r));
  const pool = withPhoto.length ? withPhoto : withStory.length ? withStory : recipes;
  return pool.length ? pool[dayNumber() % pool.length] : null;
};

const collectionsFor = (recipes: HomeRecipe[]) => [
  {
    id: 'quick',
    title: 'Under 30 minutes',
    deck: 'Weeknight dishes that are on the table fast.',
    to: '/all-recipes?time=under-30',
    items: recipes.filter(r => timeBucket(r) === 'under-30'),
  },
  {
    id: 'meat-free',
    title: 'Meat-free tables',
    deck: 'Vegetarian dishes that stand on their own.',
    to: '/all-recipes?diet=vegetarian',
    items: recipes.filter(r => recipeDiets(r).includes('vegetarian')),
  },
  {
    id: 'weekend',
    title: 'Weekend projects',
    deck: 'Longer cooks, worth the afternoon.',
    to: '/all-recipes?time=over-60',
    items: recipes.filter(r => timeBucket(r) === 'over-60'),
  },
].filter(c => c.items.length > 0);

// Cuisines grouped by region, with real counts
const cuisineIndex = (recipes: HomeRecipe[]) => {
  const regions = new Map<string, Map<string, number>>();
  recipes.forEach(r => {
    if (!r.cuisine) return;
    const region = r.region || 'More cuisines';
    const cuisines = regions.get(region) || new Map<string, number>();
    cuisines.set(r.cuisine, (cuisines.get(r.cuisine) || 0) + 1);
    regions.set(region, cuisines);
  });
  return [...regions.entries()]
    .map(([region, cuisines]) => ({
      region,
      cuisines: [...cuisines.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    }))
    .sort((a, b) => b.cuisines.length - a.cuisines.length || a.region.localeCompare(b.region));
};

const quickRoutes = (recipes: HomeRecipe[]) => [
  { label: 'Under 30 min', to: '/all-recipes?time=under-30', count: recipes.filter(r => timeBucket(r) === 'under-30').length },
  { label: 'Vegetarian', to: '/all-recipes?diet=vegetarian', count: recipes.filter(r => recipeDiets(r).includes('vegetarian')).length },
  { label: 'Easy', to: '/all-recipes?difficulty=Easy', count: recipes.filter(r => normalizeDifficulty(r.difficulty) === 'Easy').length },
].filter(route => route.count > 0);

const PhotoCredit: React.FC<{ credit?: ImageCredit }> = ({ credit }) => {
  if (!credit?.source_url) return null;
  return (
    <p className="home-credit">
      Photo: <a href={credit.source_url} target="_blank" rel="noopener noreferrer">{credit.author || 'Unknown author'}</a>
      {credit.license && (
        <>
          {', '}
          {credit.license_url
            ? <a href={credit.license_url} target="_blank" rel="noopener noreferrer">{credit.license}</a>
            : credit.license}
        </>
      )}
      {credit.source && ` via ${credit.source}`}
    </p>
  );
};

// Photo when the recipe has one, otherwise the typeset cover
const DishMedia: React.FC<{ recipe: HomeRecipe; size?: 'card' | 'hero' }> = ({ recipe, size = 'card' }) => {
  const [failed, setFailed] = useState(false);
  const src = recipeImage(recipe);
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={recipeName(recipe)}
        className="home-media__image"
        loading={size === 'hero' ? 'eager' : 'lazy'}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    // The dish name already sits beside the cover, so the cover names the cuisine
    <TypeCover
      title={recipe.cuisine || recipeName(recipe)}
      kicker={recipe.region}
      region={recipe.region}
      size={size}
    />
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();

  const [showQuickStart, setShowQuickStart] = useState(false);
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState<HomeRecipe[]>([]);
  const [recipesState, setRecipesState] = useState<LoadState>('loading');
  const [trendingRecipes, setTrendingRecipes] = useState<HomeRecipe[] | null>(null);
  const [posts, setPosts] = useState<HomePost[]>([]);
  const [postsState, setPostsState] = useState<LoadState>('loading');

  const loadRecipes = useCallback(async () => {
    setRecipesState('loading');
    try {
      // Trending is a nice-to-have here; if it fails, fall back to the full list
      const [data, trendingData] = await Promise.all([
        getAllRecipes(),
        getTrendingRecipes(5).catch(() => null),
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

  const ready = recipesState === 'ready';
  const spotlight = ready ? pickDishOfTheDay(recipes) : null;
  const others = useMemo(() => recipes.filter(r => r._id !== spotlight?._id), [recipes, spotlight]);
  const collections = useMemo(() => collectionsFor(others), [others]);
  const regions = useMemo(() => cuisineIndex(recipes), [recipes]);
  const routes = useMemo(() => quickRoutes(recipes), [recipes]);
  // Same ranking as the Trending page, minus today's dish
  const trending = (trendingRecipes || others).filter(r => r._id !== spotlight?._id).slice(0, 4);
  const stories = useMemo(() => {
    const pool = others.filter(r => r.culturalBackground);
    if (!pool.length) return [];
    const start = dayNumber() % pool.length;
    return [...pool.slice(start), ...pool.slice(0, start)].slice(0, 3);
  }, [others]);

  const spotlightMinutes = spotlight ? totalMinutes(spotlight) : null;
  const spotlightDifficulty = spotlight ? normalizeDifficulty(spotlight.difficulty) : null;
  const spotlightKicker = spotlight ? ['Dish of the day', spotlight.cuisine, spotlight.region].filter(Boolean).join(' · ') : '';

  return (
    <div className="home">
      <h1 className="visually-hidden">SavorSync: recipes from around the world and the stories behind them</h1>

      {/* 1. Hero: dish of the day */}
      <section className="home-hero" aria-labelledby="home-hero-title" aria-busy={recipesState === 'loading'}>
        {recipesState === 'loading' && (
          <div className="home-hero__inner" aria-hidden="true">
            <div className="home-hero__media skeleton"></div>
            <div className="home-hero__text">
              <div className="skeleton skeleton--line home-skel--kicker"></div>
              <div className="skeleton home-skel--title"></div>
              <div className="skeleton skeleton--line"></div>
              <div className="skeleton skeleton--line home-skel--short"></div>
            </div>
            <span className="visually-hidden">Loading today's dish</span>
          </div>
        )}

        {spotlight && (
          <article className="home-hero__inner">
            <figure className="home-hero__figure">
              <Link to={`/recipe/${spotlight._id}`} className="home-hero__media home-media" tabIndex={-1} aria-hidden="true">
                <DishMedia recipe={spotlight} size="hero" />
              </Link>
              <figcaption><PhotoCredit credit={recipeImage(spotlight) ? spotlight.image_credit : undefined} /></figcaption>
            </figure>
            <div className="home-hero__text">
              <p className="home-kicker">{spotlightKicker}</p>
              <h2 id="home-hero-title" className="home-hero__title">
                <Link to={`/recipe/${spotlight._id}`}>{recipeName(spotlight)}</Link>
              </h2>
              {spotlight.subtitle && <p className="home-deck">{spotlight.subtitle}</p>}
              {spotlight.culturalBackground && (
                <p className="home-hero__story">{firstSentences(spotlight.culturalBackground, 2)}</p>
              )}
              {(spotlightMinutes !== null || spotlightDifficulty || spotlight.servings) && (
                <ul className="home-facts" aria-label="Recipe facts">
                  {spotlightMinutes !== null && <li><i className="bi bi-clock" aria-hidden="true"></i>{formatMinutes(spotlightMinutes)}</li>}
                  {spotlightDifficulty && <li><i className="bi bi-bar-chart" aria-hidden="true"></i>{spotlightDifficulty}</li>}
                  {spotlight.servings && <li><i className="bi bi-people" aria-hidden="true"></i>Serves {spotlight.servings}</li>}
                </ul>
              )}
              <div className="home-hero__actions">
                <Link to={`/recipe/${spotlight._id}`} className="btn btn--primary">
                  Cook this dish
                  <i className="bi bi-arrow-right" aria-hidden="true"></i>
                </Link>
                <FavoriteButton recipeId={spotlight._id} recipeName={recipeName(spotlight)} />
              </div>
            </div>
          </article>
        )}

        {(recipesState === 'error' || (ready && !spotlight)) && (
          <div className="home-hero__inner home-hero__inner--plain">
            <div className="home-hero__text">
              <p className="home-kicker">{isAuthenticated && user ? `Welcome back, ${user.name}` : 'SavorSync'}</p>
              <h2 id="home-hero-title" className="home-hero__title">Cook the world's dishes, and learn the stories behind them</h2>
              {recipesState === 'error' && (
                <div className="home-inline-error" role="status">
                  <i className="bi bi-exclamation-circle" aria-hidden="true"></i>
                  <span>We couldn't load recipes. Check your connection and try again.</span>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={loadRecipes}>Try again</button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 2. Search */}
      <section className="home-search-band" aria-labelledby="home-search-title">
        <div className="home-wrap home-search-band__inner">
          <h2 id="home-search-title" className="home-search-band__title">
            <label htmlFor="home-search">What are you cooking tonight?</label>
          </h2>
          <form className="home-search" role="search" onSubmit={handleSearch}>
            <i className="bi bi-search home-search__icon" aria-hidden="true"></i>
            <input
              id="home-search"
              type="search"
              className="home-search__input"
              placeholder="A dish, an ingredient or a cuisine"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button type="submit" className="btn btn--primary home-search__submit">Search</button>
          </form>
          <div className="home-search__routes">
            {routes.map(route => (
              <Link key={route.label} to={route.to} className="chip">
                {route.label}
                <span className="home-search__count">{route.count}</span>
              </Link>
            ))}
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowQuickStart(true)}>
              <i className="bi bi-shuffle" aria-hidden="true"></i>
              Not sure? Help me pick
            </button>
          </div>
        </div>
      </section>

      <main className="home-main">
        {/* 3. Collections */}
        {ready && collections.length > 0 && (
          <section className="home-section" aria-labelledby="home-collections-title">
            <header className="home-section__header">
              <div>
                <p className="home-kicker">Collections</p>
                <h2 id="home-collections-title" className="home-section__title">Something for every kind of evening</h2>
              </div>
            </header>
            <div className="home-shelves">
              {collections.map(collection => (
                <article key={collection.id} className="home-shelf" aria-labelledby={`shelf-${collection.id}`}>
                  <h3 id={`shelf-${collection.id}`} className="home-shelf__title">{collection.title}</h3>
                  <p className="home-shelf__deck">{collection.deck}</p>
                  <ol className="home-shelf__list">
                    {collection.items.slice(0, 4).map(recipe => {
                      const minutes = totalMinutes(recipe);
                      return (
                        <li key={recipe._id}>
                          <Link to={`/recipe/${recipe._id}`} className="home-shelf__item">
                            <span className="home-shelf__name">{recipeName(recipe)}</span>
                            <span className="home-shelf__meta">
                              {[recipe.cuisine, minutes !== null ? formatMinutes(minutes) : null].filter(Boolean).join(' · ')}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                  <Link to={collection.to} className="home-link">
                    {collection.items.length > 4 ? `All ${collection.items.length} dishes` : 'See the list'}
                    <i className="bi bi-arrow-right" aria-hidden="true"></i>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 4. Browse by cuisine */}
        {ready && regions.length > 0 && (
          <section className="home-section" aria-labelledby="home-cuisines-title">
            <header className="home-section__header">
              <div>
                <p className="home-kicker">The atlas</p>
                <h2 id="home-cuisines-title" className="home-section__title">Browse by cuisine</h2>
              </div>
              <Link to="/all-recipes" className="home-link">All recipes<i className="bi bi-arrow-right" aria-hidden="true"></i></Link>
            </header>
            <div className="home-atlas">
              {regions.map(({ region, cuisines }) => (
                <div key={region} className="home-atlas__region">
                  <h3 className="home-atlas__heading">{region}</h3>
                  <ul className="home-atlas__list">
                    {cuisines.map(([cuisine, count]) => (
                      <li key={cuisine}>
                        <Link to={`/all-recipes?cuisine=${encodeURIComponent(cuisine)}`} className="home-atlas__item">
                          <span className="home-atlas__name">{cuisine}</span>
                          <span className="home-atlas__count">
                            {count}<span className="visually-hidden">{count === 1 ? ' recipe' : ' recipes'}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* 5. AI cooking assistant */}
      <section className="home-ai" aria-labelledby="home-ai-title">
        <div className="home-wrap home-ai__inner">
          <div className="home-ai__intro">
            <p className="home-kicker"><i className="bi bi-stars" aria-hidden="true"></i>Ask the kitchen</p>
            <h2 id="home-ai-title" className="home-section__title">Tell us what's in your fridge. We'll suggest a dish and its story.</h2>
            <p className="home-ai__text">
              Cook with AI writes a recipe around the ingredients you have. On any recipe page, you can also ask where the dish comes from or why an ingredient matters.
            </p>
            <Link to="/cook-with-ai" className="btn btn--secondary">
              <i className="bi bi-stars" aria-hidden="true"></i>
              Open Cook with AI
            </Link>
          </div>
          <div className="home-ai__examples">
            <p className="home-ai__label">Things people ask</p>
            <ul className="home-ai__list">
              <li>“I have eggs, rice and spinach. What can I make?”</li>
              <li>“Why do Romans leave cream out of carbonara?”</li>
              <li>“How is bibimbap served at home in Korea?”</li>
            </ul>
            <p className="home-ai__note">Answers are AI-generated and can be wrong. Check allergens and cooking times as you go.</p>
          </div>
        </div>
      </section>

      <div className="home-main">
        {/* 6. Trending */}
        {(recipesState === 'loading' || trending.length > 0) && (
          <section className="home-section" aria-labelledby="home-trending-title" aria-busy={recipesState === 'loading'}>
            <header className="home-section__header">
              <div>
                <p className="home-kicker">This week</p>
                <h2 id="home-trending-title" className="home-section__title">What people are cooking</h2>
              </div>
              <Link to="/trending-recipes" className="home-link">See all trending<i className="bi bi-arrow-right" aria-hidden="true"></i></Link>
            </header>
            <div className="home-cards">
              {recipesState === 'loading'
                ? [0, 1, 2, 3].map(i => (
                  <div key={i} className="home-card-skeleton" aria-hidden="true">
                    <div className="skeleton skeleton--image"></div>
                    <div className="skeleton skeleton--line"></div>
                  </div>
                ))
                : trending.map(recipe => <RecipeCard key={recipe._id} recipe={recipe} />)}
            </div>
          </section>
        )}

        {/* 7. Cultural food stories */}
        {stories.length > 0 && (
          <section className="home-section" aria-labelledby="home-stories-title">
            <header className="home-section__header">
              <div>
                <p className="home-kicker">Stories</p>
                <h2 id="home-stories-title" className="home-section__title">The story behind the dish</h2>
              </div>
            </header>
            <div className="home-stories">
              {stories.map((recipe, index) => (
                <article key={recipe._id} className={`home-story${index === 0 ? ' home-story--lead' : ''}`}>
                  <Link to={`/recipe/${recipe._id}`} className="home-story__link">
                    {index === 0 && (
                      <div className="home-story__media home-media"><DishMedia recipe={recipe} /></div>
                    )}
                    <p className="home-kicker">{[recipe.cuisine, recipe.region].filter(Boolean).join(' · ')}</p>
                    <h3 className="home-story__title">{recipeName(recipe)}</h3>
                    <p className="home-story__text">{firstSentences(recipe.culturalBackground, index === 0 ? 2 : 1)}</p>
                    <span className="home-link" aria-hidden="true">Read the story<i className="bi bi-arrow-right"></i></span>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 8. Community */}
        <section className="home-section home-section--last" aria-labelledby="home-community-title">
          <header className="home-section__header">
            <div>
              <p className="home-kicker">From the community</p>
              <h2 id="home-community-title" className="home-section__title">Cooked at home</h2>
            </div>
            <Link to="/community" className="home-link">Open the community<i className="bi bi-arrow-right" aria-hidden="true"></i></Link>
          </header>

          {postsState === 'loading' && (
            <div className="home-posts" aria-busy="true">
              <span className="visually-hidden">Loading posts</span>
              {[0, 1, 2].map(i => (
                <div key={i} className="home-post" aria-hidden="true">
                  <div className="home-post__media skeleton"></div>
                  <div className="home-post__body">
                    <div className="skeleton skeleton--line"></div>
                    <div className="skeleton skeleton--line home-skel--short"></div>
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
                        <img src={post.image} alt="" />
                      ) : (
                        <i className="bi bi-chat-quote home-post__placeholder" aria-hidden="true"></i>
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
              <span className="home-empty__icon" aria-hidden="true">
                <i className={`bi ${postsState === 'error' ? 'bi-exclamation-circle' : 'bi-chat-heart'}`}></i>
              </span>
              <h3 className="home-empty__title">
                {postsState === 'error' ? "We couldn't load community posts" : 'No posts yet'}
              </h3>
              <p className="home-empty__text">
                {postsState === 'error' ? 'Check your connection and try again.' : 'Share what you cooked to start the conversation.'}
              </p>
              {postsState === 'error' ? (
                <button type="button" className="btn btn--ghost" onClick={loadPosts}>Try again</button>
              ) : (
                <Link to={isAuthenticated ? '/create-post' : '/login'} className="btn btn--primary">
                  <i className="bi bi-camera" aria-hidden="true"></i>
                  Share your dish
                </Link>
              )}
            </div>
          )}
        </section>
      </div>

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
            <Link to="/cook-with-ai">Cook with AI</Link>
            <Link to="/shopping-list">Shopping list</Link>
          </nav>
          <nav className="home-footer__col" aria-label="Cuisines">
            <h3 className="home-footer__heading">Cuisines</h3>
            {(regions.length ? regions.flatMap(r => r.cuisines.map(([c]) => c)) : []).slice(0, 4).map(cuisine => (
              <Link key={cuisine} to={`/all-recipes?cuisine=${encodeURIComponent(cuisine)}`}>{cuisine}</Link>
            ))}
            <Link to="/all-recipes">Every cuisine</Link>
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
