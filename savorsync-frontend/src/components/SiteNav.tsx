import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './SiteNav.css';

const links = [
  { to: '/all-recipes', label: 'Recipes' },
  { to: '/trending-recipes', label: 'Trending' },
  { to: '/community', label: 'Community' },
];

// Shared top navigation shown on every page
const SiteNav: React.FC = () => {
  const { user, isAuthenticated } = useUser();

  return (
    <nav className="site-nav">
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
