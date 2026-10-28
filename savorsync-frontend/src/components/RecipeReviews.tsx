import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { getReviews, saveReview, deleteReview, Review, ReviewSummary } from '../services/apiReviews';
import { uploadImage } from '../services/apiUpload';
import { InlineError, InlineSpinner } from './ui/States';
import './RecipeReviews.css';

interface RecipeReviewsProps {
  recipeId: string;
  recipeName: string;
  // Lets the page show the average next to the title
  onSummary?: (summary: ReviewSummary) => void;
}

export const Stars: React.FC<{ value: number; label?: string }> = ({ value, label }) => (
  <span className="stars" role="img" aria-label={label || `${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map(n => (
      <i
        key={n}
        className={`bi ${value >= n ? 'bi-star-fill' : value >= n - 0.5 ? 'bi-star-half' : 'bi-star'}`}
        aria-hidden="true"
      ></i>
    ))}
  </span>
);

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
};

// "I made this" (README future plan): rating, a short note and a photo, one per cook
const RecipeReviews: React.FC<RecipeReviewsProps> = ({ recipeId, recipeName, onSummary }) => {
  const { user, isAuthenticated } = useUser();
  const { showToast } = useToast();
  const location = useLocation();
  const fileInput = useRef<HTMLInputElement>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({ count: 0, average: null });
  const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const userId = user ? String((user as { _id?: string })._id || user.id) : '';
  const mine = reviews.find(review => review.userId === userId);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const result = await getReviews(recipeId);
      setReviews(result.reviews);
      setSummary(result.summary);
      onSummary?.(result.summary);
      setState('ready');
    } catch {
      setState('error');
    }
  }, [recipeId, onSummary]);

  useEffect(() => { load(); }, [load]);

  const openForm = () => {
    setRating(mine?.rating || 0);
    setText(mine?.text || '');
    setImageUrl(mine?.imageUrl || null);
    setFormError('');
    setFormOpen(true);
  };

  const onPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setFormError('Choose a photo under 5 MB.');
      return;
    }
    setUploading(true);
    setFormError('');
    try {
      setImageUrl((await uploadImage(file)).imageUrl);
    } catch {
      setFormError("Couldn't upload that photo. You can still post without it.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!rating) {
      setFormError('Choose 1 to 5 stars.');
      return;
    }
    setSaving(true);
    try {
      await saveReview(recipeId, { rating, text: text.trim(), imageUrl });
      setFormOpen(false);
      showToast(mine ? 'Review updated' : `Thanks for cooking ${recipeName}!`, 'success');
      load();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await deleteReview(recipeId);
      setFormOpen(false);
      showToast('Review removed', 'success');
      load();
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  return (
    <section className="reviews" id="reviews" aria-labelledby="reviews-title">
      <div className="reviews__header">
        <div>
          <h2 id="reviews-title" className="recipe-section-title reviews__title">Cooks who made this</h2>
          {summary.count > 0 && summary.average !== null && (
            <p className="reviews__summary">
              <Stars value={summary.average} label={`Rated ${summary.average} out of 5`} />
              <span><strong>{summary.average}</strong> from {summary.count} {summary.count === 1 ? 'cook' : 'cooks'}</span>
            </p>
          )}
        </div>
        {!formOpen && (isAuthenticated ? (
          <button type="button" className="btn btn--primary" onClick={openForm}>
            <i className="bi bi-camera" aria-hidden="true"></i>
            {mine ? 'Edit your review' : 'I made this'}
          </button>
        ) : (
          <Link to="/login" state={{ from: location.pathname }} className="btn btn--secondary reviews__signin">
            Sign in to review
          </Link>
        ))}
      </div>

      {formOpen && (
        <form className="reviews__form" onSubmit={submit}>
          <fieldset className="reviews__rating">
            <legend className="reviews__label">Your rating</legend>
            <div className="reviews__star-input" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map(n => (
                <label key={n} className="reviews__star" onMouseEnter={() => setHover(n)}>
                  <input
                    type="radio"
                    name="rating"
                    value={n}
                    checked={rating === n}
                    onChange={() => setRating(n)}
                    className="visually-hidden"
                  />
                  <i className={`bi ${(hover || rating) >= n ? 'bi-star-fill' : 'bi-star'}`} aria-hidden="true"></i>
                  <span className="visually-hidden">{n} {n === 1 ? 'star' : 'stars'}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="reviews__label" htmlFor="review-text">How did it go? (optional)</label>
          <textarea
            id="review-text"
            className="reviews__textarea"
            rows={3}
            maxLength={1000}
            value={text}
            onChange={event => setText(event.target.value)}
            placeholder="Any twists, tips or memories?"
          />

          <div className="reviews__photo">
            {imageUrl ? (
              <div className="reviews__preview">
                <img src={imageUrl} alt="Your photo of the dish" />
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setImageUrl(null)}>Remove photo</button>
              </div>
            ) : (
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => fileInput.current?.click()} disabled={uploading}>
                {uploading ? <InlineSpinner label="Uploading photo" /> : <i className="bi bi-image" aria-hidden="true"></i>}
                {uploading ? 'Uploading…' : 'Add a photo'}
              </button>
            )}
            <input ref={fileInput} type="file" accept="image/*" className="visually-hidden" onChange={onPhoto} tabIndex={-1} />
          </div>

          {formError && <p className="reviews__error" role="alert">{formError}</p>}

          <div className="reviews__form-actions">
            <button type="submit" className="btn btn--primary" disabled={saving || uploading}>
              {saving ? 'Posting…' : mine ? 'Update review' : 'Post review'}
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setFormOpen(false)}>Cancel</button>
            {mine && (
              <button type="button" className="btn btn--ghost reviews__delete" onClick={remove}>Delete</button>
            )}
          </div>
        </form>
      )}

      {state === 'loading' && <InlineSpinner label="Loading reviews" />}
      {state === 'error' && <InlineError message="Couldn't load reviews." onRetry={load} />}
      {state === 'ready' && reviews.length === 0 && !formOpen && (
        <p className="reviews__empty">No one has posted yet. Cooked it? Be the first to share how it went.</p>
      )}
      {state === 'ready' && reviews.length > 0 && (
        <ul className="reviews__list">
          {reviews.map(review => (
            <li key={review._id} className="review">
              <div className="review__head">
                {review.userAvatar ? (
                  <img src={review.userAvatar} alt="" className="review__avatar" />
                ) : (
                  <i className="bi bi-person-circle review__avatar-icon" aria-hidden="true"></i>
                )}
                <div className="review__who">
                  <span className="review__name">{review.userName}{review.userId === userId && ' (you)'}</span>
                  <span className="review__date">{formatDate(review.updatedAt)}</span>
                </div>
                <Stars value={review.rating} />
              </div>
              {review.text && <p className="review__text">{review.text}</p>}
              {review.imageUrl && <img src={review.imageUrl} alt={`${review.userName}'s ${recipeName}`} className="review__photo" loading="lazy" />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default RecipeReviews;
