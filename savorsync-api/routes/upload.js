const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

// Upload single image
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('📸 Uploading image to Cloudinary:', req.file.filename);

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'savorsync/recipes',
      transformation: [
        { width: 800, height: 600, crop: 'fill' },
        { quality: 'auto' }
      ]
    });

    // Delete temporary file
    fs.unlinkSync(req.file.path);

    console.log('✅ Image uploaded successfully:', result.secure_url);

    res.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('❌ Image upload error:', error);
    
    // Clean up temporary file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      error: 'Failed to upload image',
      details: error.message 
    });
  }
});

// Upload multiple images
router.post('/images', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    console.log(`📸 Uploading ${req.files.length} images to Cloudinary`);

    const uploadPromises = req.files.map(async (file) => {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'savorsync/recipes',
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto' }
          ]
        });

        // Delete temporary file
        fs.unlinkSync(file.path);

        return {
          originalName: file.originalname,
          imageUrl: result.secure_url,
          publicId: result.public_id
        };
      } catch (error) {
        console.error(`❌ Failed to upload ${file.originalname}:`, error);
        // Clean up temporary file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw error;
      }
    });

    const results = await Promise.all(uploadPromises);

    console.log('✅ All images uploaded successfully');

    res.json({
      success: true,
      images: results,
      message: `${results.length} images uploaded successfully`
    });

  } catch (error) {
    console.error('❌ Multiple image upload error:', error);
    
    // Clean up any remaining temporary files
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({ 
      error: 'Failed to upload images',
      details: error.message 
    });
  }
});

// Delete image from Cloudinary
router.delete('/image/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;

    console.log('🗑️ Deleting image from Cloudinary:', publicId);

    const result = await cloudinary.uploader.destroy(publicId);

    console.log('✅ Image deleted successfully');

    res.json({
      success: true,
      message: 'Image deleted successfully',
      result
    });

  } catch (error) {
    console.error('❌ Image deletion error:', error);
    res.status(500).json({ 
      error: 'Failed to delete image',
      details: error.message 
    });
  }
});

module.exports = router; 