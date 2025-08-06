import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import ProfileImageUpload from '../../components/ProfileImageUpload';
import './ProfileImageUploadDemo.css';

const ProfileImageUploadDemo: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();

  const handleImageUploaded = (imageUrl: string) => {
    console.log('Profile image uploaded:', imageUrl);
    // You can add additional logic here, like showing a toast notification
  };

  if (!isAuthenticated) {
    return (
      <div className="profile-upload-demo-page">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in to upload your profile image.</p>
          <button onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-upload-demo-page">
      <div className="demo-container">
        {/* Header */}
        <div className="demo-header">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
          <div className="header-content">
            <h1>📸 Profile Image Upload</h1>
            <p>Upload and manage your profile picture using Cloudinary</p>
          </div>
        </div>

        {/* User Info */}
        <div className="user-info-section">
          <div className="user-card">
            <img 
              src={user?.avatar || '/default-avatar.png'} 
              alt={user?.name}
              className="user-avatar-large"
            />
            <div className="user-details">
              <h3>{user?.name}</h3>
              <p>{user?.email}</p>
              <span className="user-status">Logged In</span>
            </div>
          </div>
        </div>

        {/* Upload Component */}
        <div className="upload-section">
          <h2>Upload New Profile Image</h2>
          <ProfileImageUpload onImageUploaded={handleImageUploaded} />
        </div>

        {/* Features List */}
        <div className="features-section">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <i className="bi bi-cloud-upload"></i>
              <h3>Cloudinary Integration</h3>
              <p>Images are automatically uploaded to Cloudinary CDN for fast loading</p>
            </div>
            <div className="feature-card">
              <i className="bi bi-image"></i>
              <h3>Image Optimization</h3>
              <p>Automatic resizing to 400x400px with face detection and quality optimization</p>
            </div>
            <div className="feature-card">
              <i className="bi bi-shield-check"></i>
              <h3>File Validation</h3>
              <p>Supports JPEG, PNG, GIF, WebP formats with 5MB size limit</p>
            </div>
            <div className="feature-card">
              <i className="bi bi-eye"></i>
              <h3>Live Preview</h3>
              <p>See your image before uploading with drag & drop support</p>
            </div>
            <div className="feature-card">
              <i className="bi bi-arrow-repeat"></i>
              <h3>Real-time Updates</h3>
              <p>Profile image updates immediately across the app</p>
            </div>
            <div className="feature-card">
              <i className="bi bi-trash"></i>
              <h3>Cleanup</h3>
              <p>Automatic cleanup of temporary files and old images</p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="tech-details">
          <h2>Technical Implementation</h2>
          <div className="tech-grid">
            <div className="tech-item">
              <h4>Backend</h4>
              <ul>
                <li>Express.js with Multer for file handling</li>
                <li>Cloudinary SDK for image upload and optimization</li>
                <li>JWT authentication for secure uploads</li>
                <li>Automatic file cleanup and validation</li>
              </ul>
            </div>
            <div className="tech-item">
              <h4>Frontend</h4>
              <ul>
                <li>React with TypeScript for type safety</li>
                <li>FormData API for file uploads</li>
                <li>Drag & drop support with preview</li>
                <li>Context API for state management</li>
              </ul>
            </div>
            <div className="tech-item">
              <h4>Security</h4>
              <ul>
                <li>File type validation (images only)</li>
                <li>File size limits (5MB max)</li>
                <li>Authentication required for uploads</li>
                <li>Secure Cloudinary configuration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageUploadDemo; 