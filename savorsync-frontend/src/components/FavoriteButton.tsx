import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import './FavoriteButton.css';

interface FavoriteButtonProps {
  recipeId: string;
  recipeName: string;
  // "overlay" sits on a photo; "plain" sits in a row of icon buttons
  variant?: 'overlay' | 'plain';
}

// Heart icon button (design.md 4.1 Icon, 4.3). Visitors who aren't signed in
// are sent to sign in and brought back here afterwards.
const FavoriteButton: React.FC<FavoriteButtonProps> = ({ recipeId, recipeName, variant = 'plain' }) => {
  const { isAuthenticated, isFavorite, toggleFavorite } = useUser();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const saved = isFavorite(recipeId);

  const handleClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated) {
      showToast('Sign in to save recipes to your favorites.', 'info');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      await toggleFavorite(recipeId);
      showToast(saved ? `Removed ${recipeName} from favorites` : `Saved ${recipeName} to favorites`, 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={`btn btn--icon favorite-btn favorite-btn--${variant}`}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${recipeName} from favorites` : `Save ${recipeName} to favorites`}
      onClick={handleClick}
    >
      <i className={`bi ${saved ? 'bi-heart-fill' : 'bi-heart'}`} aria-hidden="true"></i>
    </button>
  );
};

export default FavoriteButton;
