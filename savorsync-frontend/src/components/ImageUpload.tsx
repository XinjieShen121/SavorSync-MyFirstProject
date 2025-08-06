import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  IconButton,
  LinearProgress,
  Paper
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { uploadImageWithProgress, deleteImage, UploadProgressCallback } from '../services/apiUpload';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string, publicId: string) => void;
  onImageDelete?: (publicId: string) => void;
  currentImageUrl?: string;
  currentPublicId?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  label?: string;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  onImageDelete,
  currentImageUrl,
  currentPublicId,
  maxSize = 5, // 5MB default
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  label = 'Upload Recipe Image',
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setError(`Please select a valid image file (${acceptedTypes.join(', ')})`);
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      const progressCallback: UploadProgressCallback = (progress) => {
        setUploadProgress(progress);
      };

      const result = await uploadImageWithProgress(file, progressCallback);
      
      // Delete previous image if exists
      if (currentPublicId && onImageDelete) {
        try {
          await deleteImage(currentPublicId);
        } catch (deleteError) {
          console.warn('Failed to delete previous image:', deleteError);
        }
      }

      onImageUpload(result.imageUrl, result.publicId);
      setError(null);
    } catch (uploadError: any) {
      setError(uploadError.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async () => {
    if (!currentPublicId || !onImageDelete) return;

    try {
      await deleteImage(currentPublicId);
      onImageDelete(currentPublicId);
      setError(null);
    } catch (deleteError: any) {
      setError('Failed to delete image');
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {currentImageUrl ? (
        // Show current image with delete option
        <Card sx={{ position: 'relative', mb: 2 }}>
          <CardMedia
            component="img"
            height="200"
            image={currentImageUrl}
            alt="Recipe"
            sx={{ objectFit: 'cover' }}
          />
          {onImageDelete && (
            <IconButton
              onClick={handleDeleteImage}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              <DeleteIcon color="error" />
            </IconButton>
          )}
        </Card>
      ) : (
        // Show upload area
        <Paper
          sx={{
            border: '2px dashed',
            borderColor: 'primary.main',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: 'action.hover',
            }
          }}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={disabled || uploading}
          />
          
          {uploading ? (
            <Box>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Uploading... {uploadProgress}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                sx={{ mt: 1 }}
              />
            </Box>
          ) : (
            <Box>
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                {label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click to upload or drag and drop
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {acceptedTypes.join(', ')} • Max {maxSize}MB
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {!currentImageUrl && !uploading && (
        <Button
          variant="outlined"
          startIcon={<PhotoCameraIcon />}
          onClick={handleClick}
          disabled={disabled}
          sx={{ mt: 1 }}
        >
          Choose Image
        </Button>
      )}
    </Box>
  );
};

export default ImageUpload; 