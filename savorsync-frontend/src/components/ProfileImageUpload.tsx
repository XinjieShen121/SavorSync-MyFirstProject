import React, { useState, useRef } from 'react';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import './ProfileImageUpload.css';

interface ProfileImageUploadProps {
  onImageUploaded?: (imageUrl: string) => void;
  className?: string;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({ 
  onImageUploaded, 
  className = '' 
}) => {
  const { user, updateUser } = useUser();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please select a JPEG, PNG, GIF, or WebP image.');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File size too large. Please select an image smaller than 5MB.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setSuccess(null);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('profileImage', selectedFile);

      // Get token for authentication
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Upload to backend
      const response = await axios.post(
        'http://localhost:3001/api/profile-upload/profile-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const { imageUrl } = response.data;

      // Update user context with new avatar
      await updateUser({ avatar: imageUrl });

      setSuccess('Profile image uploaded successfully!');
      
      // Call callback if provided
      if (onImageUploaded) {
        onImageUploaded(imageUrl);
      }

      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      setError(
        error.response?.data?.error || 
        error.message || 
        'Failed to upload image. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      // Handle the dropped file directly
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please select a JPEG, PNG, GIF, or WebP image.');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('File size too large. Please select an image smaller than 5MB.');
        return;
      }

      setSelectedFile(file);
      setError(null);
      setSuccess(null);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear selection
  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`profile-image-upload ${className}`}>
      <div className="upload-container">
        {/* Current Profile Image */}
        <div className="current-image">
          <img 
            src={user?.avatar || '/default-avatar.png'} 
            alt="Current profile" 
            className="profile-avatar"
          />
          <span className="current-label">Current Profile Image</span>
        </div>

        {/* Upload Area */}
        <div 
          className={`upload-area ${selectedFile ? 'has-file' : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {!selectedFile ? (
            <div className="upload-prompt">
              <i className="bi bi-cloud-upload"></i>
              <h3>Upload Profile Image</h3>
              <p>Drag and drop an image here, or click to select</p>
              <button 
                type="button" 
                className="select-file-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </button>
              <div className="file-requirements">
                <p>Supported formats: JPEG, PNG, GIF, WebP</p>
                <p>Maximum size: 5MB</p>
              </div>
            </div>
          ) : (
            <div className="file-preview">
              <img src={previewUrl!} alt="Preview" className="preview-image" />
              <div className="file-info">
                <p className="file-name">{selectedFile.name}</p>
                <p className="file-size">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {/* Action Buttons */}
        {selectedFile && (
          <div className="upload-actions">
            <button
              type="button"
              className="upload-btn"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <i className="bi bi-arrow-clockwise spinning"></i>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-upload"></i>
                  Upload Image
                </>
              )}
            </button>
            <button
              type="button"
              className="clear-btn"
              onClick={handleClear}
              disabled={uploading}
            >
              <i className="bi bi-x-circle"></i>
              Clear
            </button>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="message error">
            <i className="bi bi-exclamation-circle"></i>
            {error}
          </div>
        )}

        {success && (
          <div className="message success">
            <i className="bi bi-check-circle"></i>
            {success}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileImageUpload; 