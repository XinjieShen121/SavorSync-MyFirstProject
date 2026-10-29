import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './States.css';

// Loading, empty and error states (design.md 4.7)

interface SkeletonProps {
  variant?: 'text' | 'image' | 'circle';
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ variant = 'text', width, height }) => (
  <span className={`skeleton skeleton--${variant}`} style={{ width, height }} aria-hidden="true" />
);

export const RecipeCardSkeleton: React.FC = () => (
  <div className="skeleton-card" aria-hidden="true">
    <Skeleton variant="image" />
    <div className="skeleton-card__body">
      <Skeleton width="80%" />
      <Skeleton width="45%" />
    </div>
  </div>
);

export const RecipeGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="skeleton-grid">
    {Array.from({ length: count }, (_, i) => <RecipeCardSkeleton key={i} />)}
  </div>
);

export const PostSkeleton: React.FC = () => (
  <div className="skeleton-post" aria-hidden="true">
    <div className="skeleton-post__head">
      <Skeleton variant="circle" width="40px" height="40px" />
      <Skeleton width="40%" />
    </div>
    <Skeleton width="100%" />
    <Skeleton width="90%" />
    <Skeleton width="60%" />
    <Skeleton variant="image" />
  </div>
);

export const ProfileSkeleton: React.FC = () => (
  <div className="skeleton-profile" aria-hidden="true">
    <Skeleton variant="circle" width="96px" height="96px" />
    <Skeleton width="40%" />
    <Skeleton width="60%" />
    <RecipeGridSkeleton count={4} />
  </div>
);

export const RecipeDetailSkeleton: React.FC = () => (
  <div className="skeleton-detail" aria-hidden="true">
    <Skeleton variant="image" />
    <div className="skeleton-detail__text">
      <Skeleton width="30%" />
      <Skeleton width="85%" height="3rem" />
      <Skeleton width="60%" />
      {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} width={`${70 - i * 10}%`} />)}
    </div>
  </div>
);

interface LoadingStateProps {
  // Screen-reader text, e.g. "Loading recipes"
  label: string;
  children: React.ReactNode;
}

// Shows nothing for the first 300ms, then the skeleton; after 8s adds a waking-up note
export const LoadingState: React.FC<LoadingStateProps> = ({ label, children }) => {
  const [visible, setVisible] = useState(false);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const show = window.setTimeout(() => setVisible(true), 300);
    const wait = window.setTimeout(() => setSlow(true), 8000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(wait);
    };
  }, []);
  return (
    <div className="loading-state" aria-busy="true" aria-live="polite">
      <span className="visually-hidden">{label}</span>
      {visible && children}
      {slow && <p className="loading-state__slow">Still loading. The server may be waking up.</p>}
    </div>
  );
};

interface StateAction {
  label: string;
  onClick?: () => void;
  to?: string;
  variant: 'primary' | 'secondary' | 'ghost';
}

const ActionButton: React.FC<{ action: StateAction }> = ({ action }) =>
  action.to ? (
    <Link to={action.to} className={`btn btn--${action.variant}`}>{action.label}</Link>
  ) : (
    <button type="button" className={`btn btn--${action.variant}`} onClick={action.onClick}>{action.label}</button>
  );

interface EmptyStateProps {
  icon: string;
  title: string;
  body?: string;
  action?: StateAction;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, body, action }) => (
  <div className="state">
    <span className="state__icon"><i className={`bi ${icon}`} aria-hidden="true"></i></span>
    <h2 className="state__title">{title}</h2>
    {body && <p className="state__body">{body}</p>}
    {action && <div className="state__actions"><ActionButton action={action} /></div>}
  </div>
);

interface ErrorStateProps {
  title?: string;
  body?: string;
  onRetry?: () => void;
  // The ghost way out, e.g. { label: 'Back to recipes', to: '/all-recipes' }
  exit?: { label: string; to: string };
  // Replaces Try again, e.g. a Sign in button for 401s
  primary?: StateAction;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "We couldn't load this",
  body = 'Check your connection and try again.',
  onRetry,
  exit,
  primary,
}) => (
  <div className="state state--error" role="alert">
    <span className="state__icon"><i className="bi bi-exclamation-circle" aria-hidden="true"></i></span>
    <h2 className="state__title">{title}</h2>
    <p className="state__body">{body}</p>
    <div className="state__actions">
      {primary ? <ActionButton action={primary} /> : onRetry && <ActionButton action={{ label: 'Try again', onClick: onRetry, variant: 'primary' }} />}
      {exit && <ActionButton action={{ ...exit, variant: 'ghost' }} />}
    </div>
  </div>
);

export const InlineError: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="inline-error" role="alert">
    <i className="bi bi-exclamation-circle" aria-hidden="true"></i>
    <span>{message}</span>
    {onRetry && <button type="button" className="btn btn--ghost btn--sm" onClick={onRetry}>Try again</button>}
  </div>
);

export const InlineSpinner: React.FC<{ label?: string }> = ({ label = 'Loading' }) => (
  <span className="inline-spinner" role="status">
    <span className="visually-hidden">{label}</span>
  </span>
);
