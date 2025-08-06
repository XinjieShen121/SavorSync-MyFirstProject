import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Alert,
  Divider
} from '@mui/material';
import ImageUpload from '../../components/ImageUpload';

const ImageUploadDemo: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<{
    url: string;
    publicId: string;
  } | null>(null);

  const handleImageUpload = (imageUrl: string, publicId: string) => {
    setUploadedImage({ url: imageUrl, publicId });
  };

  const handleImageDelete = (publicId: string) => {
    setUploadedImage(null);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        📸 Image Upload Demo
      </Typography>
      
      <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Test Cloudinary + Multer Integration
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Upload Recipe Image
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload an image to see it stored in Cloudinary and displayed here.
            </Typography>
            
            <ImageUpload
              onImageUpload={handleImageUpload}
              onImageDelete={handleImageDelete}
              currentImageUrl={uploadedImage?.url}
              currentPublicId={uploadedImage?.publicId}
              label="Upload Recipe Image"
              maxSize={5}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Upload Details
            </Typography>
            
            {uploadedImage ? (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  ✅ Image uploaded successfully!
                </Alert>
                
                <Typography variant="subtitle2" gutterBottom>
                  Image URL:
                </Typography>
                <Typography variant="body2" sx={{ 
                  wordBreak: 'break-all', 
                  backgroundColor: 'grey.100', 
                  p: 1, 
                  borderRadius: 1,
                  mb: 2
                }}>
                  {uploadedImage.url}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  Public ID:
                </Typography>
                <Typography variant="body2" sx={{ 
                  wordBreak: 'break-all', 
                  backgroundColor: 'grey.100', 
                  p: 1, 
                  borderRadius: 1
                }}>
                  {uploadedImage.publicId}
                </Typography>
              </Box>
            ) : (
              <Alert severity="info">
                📤 Upload an image to see the details here
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            🚀 Features Implemented
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="h6" color="primary" gutterBottom>
                Backend (Node.js + Express)
              </Typography>
              <ul>
                <li>✅ Cloudinary configuration</li>
                <li>✅ Multer middleware for file uploads</li>
                <li>✅ Single image upload endpoint</li>
                <li>✅ Multiple image upload endpoint</li>
                <li>✅ Image deletion endpoint</li>
                <li>✅ File validation (type & size)</li>
                <li>✅ Automatic image optimization</li>
              </ul>
            </Box>
            
            <Box>
              <Typography variant="h6" color="primary" gutterBottom>
                Frontend (React + Material UI)
              </Typography>
              <ul>
                <li>✅ Reusable ImageUpload component</li>
                <li>✅ Progress tracking</li>
                <li>✅ Drag & drop support</li>
                <li>✅ File validation</li>
                <li>✅ Error handling</li>
                <li>✅ Image preview</li>
                <li>✅ Delete functionality</li>
              </ul>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Alert severity="warning">
          <Typography variant="body2">
            <strong>Note:</strong> Make sure to set up your Cloudinary credentials in the .env file:
            <br />
            CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
};

export default ImageUploadDemo; 