import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { uploadProfileImage, uploadProfileImageWithProgress } from '../../services/apiUpload';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, loading, updateUser } = useUser();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File size too large. Maximum size is 5MB.');
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

      alert('Profile photo updated successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload profile photo');
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
          <i className="bi bi-heart"></i>
          <span>{user?.favorites.length || 0} Favorites</span>
        </div>
        <div className="stat-item">
          <i className="bi bi-bookmark"></i>
          <span>{user?.savedRecipes.length || 0} Saved Recipes</span>
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
        
        <div className="profile-section">
          <h3>My Favorites</h3>
          <div className="favorites-list">
            {user?.favorites.length ? (
              user.favorites.map((favorite, index) => (
                <div key={index} className="favorite-item">
                  <i className="bi bi-heart-fill"></i>
                  <span>{favorite}</span>
                </div>
              ))
            ) : (
              <p className="no-favorites">No favorites yet. Start exploring recipes!</p>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h3>Saved Recipes</h3>
          <div className="saved-recipes-list">
            {user?.savedRecipes.length ? (
              user.savedRecipes.map((recipe, index) => (
                <div key={index} className="saved-recipe-item">
                  <i className="bi bi-bookmark-fill"></i>
                  <span>{recipe}</span>
                </div>
              ))
            ) : (
              <p className="no-saved">No saved recipes yet. Save some recipes to see them here!</p>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h3>Preferences</h3>
          <div className="preferences">
            <div className="preference-item">
              <strong>Favorite Cuisines:</strong>
              <span>Asian, Mediterranean</span>
            </div>
            <div className="preference-item">
              <strong>Cooking Level:</strong>
              <span>Intermediate</span>
            </div>
            <div className="preference-item">
              <strong>Dietary Preferences:</strong>
              <span>Vegetarian-friendly</span>
            </div>
          </div>
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