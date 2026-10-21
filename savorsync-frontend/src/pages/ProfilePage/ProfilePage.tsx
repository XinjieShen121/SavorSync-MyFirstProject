import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { uploadProfileImage, uploadProfileImageWithProgress } from '../../services/apiUpload';
import { getFavoriteRecipes } from '../../services/apiFavorites';
import RecipeCard, { RecipeCardRecipe } from '../../components/RecipeCard';
import { EmptyState, InlineError, RecipeGridSkeleton } from '../../components/ui/States';
import '../../styles/shared-layout.css';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, loading, updateUser } = useUser();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeCardRecipe[]>([]);
  const [favoritesState, setFavoritesState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [favoritesError, setFavoritesError] = useState('');

  const loadFavorites = useCallback(async () => {
    setFavoritesState('loading');
    try {
      setFavoriteRecipes(await getFavoriteRecipes());
      setFavoritesState('ready');
    } catch (err) {
      setFavoritesError((err as Error).message);
      setFavoritesState('error');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadFavorites();
  }, [isAuthenticated, loadFavorites]);

  // Un-hearting a card here removes it from the grid right away
  const favoriteIds = user?.favorites || [];
  const visibleFavorites = favoriteRecipes.filter(recipe => favoriteIds.includes(recipe._id));

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Please select a valid image file (JPEG, PNG, GIF, or WebP)', 'error');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showToast('File size too large. Maximum size is 5MB.', 'error');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const result = await uploadProfileImageWithProgress(file, (progress) => {
        setUploadProgress(progress);
      });

      // Update user profile in database
      await updateUser({ avatar: result.imageUrl });

      showToast('Profile photo updated successfully!', 'success');
    } catch (error: any) {
      console.error('Upload error:', error);
      showToast(error.message || 'Failed to upload profile photo', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="user-profile">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="user-profile">
        <div className="auth-prompt">
          <h2>Please Log In</h2>
          <p>You need to be logged in to view your profile.</p>
          <div className="auth-buttons">
            <button className="login-button" onClick={() => navigate('/login')}>
              Log In
            </button>
            <button className="register-button" onClick={() => navigate('/register')}>
              Create Account
            </button>
          </div>
          <button className="back-button" onClick={handleBackToHome}>
            <i className="bi bi-arrow-left"></i> Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <button className="back-button" onClick={handleBackToHome}>
        <i className="bi bi-arrow-left"></i> Back to Home
      </button>
      
      <div className="profile-header">
        <div className="profile-avatar-container">
          <img 
            src={user?.avatar || "https://i.pravatar.cc/150?img=1"} 
            alt="User Avatar" 
            className={`profile-avatar ${uploading ? 'uploading' : ''}`}
            onClick={handleProfileImageClick}
          />
          {uploading && (
            <div className="upload-overlay">
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span>{uploadProgress}%</span>
              </div>
            </div>
          )}
          <div className="avatar-upload-hint">
            <i className="bi bi-camera"></i>
            <span>Click to upload photo</span>
          </div>
        </div>
        <h2>{user?.name || 'User'}</h2>
        <p>Food Enthusiast</p>
      </div>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      
      <div className="profile-stats">
        <div className="stat-item">
          <i className="bi bi-heart" aria-hidden="true"></i>
          <span>{favoriteIds.length} Favorites</span>
        </div>
        <div className="stat-item">
          <i className="bi bi-star"></i>
          <span>{user?.reviews || 0} Reviews</span>
        </div>
      </div>

      <div className="profile-sections">
        <div className="profile-section">
          <h3>My Recipes</h3>
          <div className="user-recipes">
            {/* Add user's recipes here */}
            <p>No recipes created yet. Start cooking to see your creations here!</p>
          </div>
        </div>
        
        <div className="profile-section profile-section--favorites">
          <h3>My Favorites</h3>
          {favoritesState === 'loading' && <RecipeGridSkeleton count={4} />}
          {favoritesState === 'error' && <InlineError message={favoritesError} onRetry={loadFavorites} />}
          {favoritesState === 'ready' && (visibleFavorites.length ? (
            <div className="recipe-page-grid">
              {visibleFavorites.map(recipe => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="bi-heart"
              title="No saved recipes"
              body="Tap the heart on any recipe to save it here."
              action={{ label: 'Find recipes', to: '/all-recipes', variant: 'secondary' }}
            />
          ))}
        </div>
      </div>

      {/* Logout button at the bottom */}
      <div className="logout-section">
        <button className="logout-button" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i> Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage; 