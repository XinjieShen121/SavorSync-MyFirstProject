import React, { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useShoppingList } from '../context/ShoppingListContext';
import './SiteNav.css';

const links = [
  { to: '/all-recipes', label: 'Recipes' },
  { to: '/trending-recipes', label: 'Trending' },
  { to: '/cook-with-ai', label: 'Cook with AI' },
  { to: '/community', label: 'Community' },
];

// Shared top navigation shown on every page
const SiteNav: React.FC = () => {
  const { user, isAuthenticated } = useUser();
  const { remaining } = useShoppingList();
  const navRef = useRef<HTMLElement>(null);

  // Publish the nav's height (it wraps to two rows on phones) so sticky
  // page elements can sit just below it: top: var(--site-nav-height)
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === 'undefined') return;
    const update = () => document.documentElement.style.setProperty('--site-nav-height', `${nav.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="site-nav" ref={navRef}>
      <div className="site-nav__inner">
        <Link to="/" className="site-nav__logo">
          <i className="bi bi-egg-fried"></i>
          SavorSync
        </Link>

        <div className="site-nav__links">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `site-nav__link${isActive ? ' is-active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="site-nav__actions">
          <Link to="/all-recipes" className="site-nav__icon" aria-label="Search recipes">
            <i className="bi bi-search"></i>
          </Link>
          <Link
            to="/shopping-list"
            className="site-nav__icon site-nav__icon--badged"
            aria-label={remaining ? `Shopping list, ${remaining} to buy` : 'Shopping list'}
          >
            <i className="bi bi-basket"></i>
            {remaining > 0 && <span className="site-nav__badge" aria-hidden="true">{remaining > 99 ? '99+' : remaining}</span>}
          </Link>
          {isAuthenticated ? (
            <Link to="/profile" className="site-nav__icon" aria-label="Your profile">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="site-nav__avatar" />
              ) : (
                <i className="bi bi-person-circle"></i>
              )}
            </Link>
          ) : (
            <Link to="/login" className="site-nav__signin">Sign in</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default SiteNav;
