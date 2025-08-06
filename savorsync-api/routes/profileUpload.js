const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Upload profile image
router.post('/profile-image', auth, upload.single('profileImage'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      // Remove uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' });
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      // Remove uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'savorsync-profiles',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ],
      public_id: `profile_${req.user.id}_${Date.now()}`
    });

    // Remove temporary file
    fs.unlinkSync(req.file.path);

    // Return the Cloudinary URL
    res.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      message: 'Profile image uploaded successfully'
    });

  } catch (error) {
    console.error('Profile image upload error:', error);
    
    // Clean up temporary file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      error: 'Failed to upload profile image',
      details: error.message 
    });
  }
});

// Delete profile image (optional - for cleanup)
router.delete('/profile-image/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({ 
        success: true, 
        message: 'Profile image deleted successfully' 
      });
    } else {
      res.status(400).json({ error: 'Failed to delete image from Cloudinary' });
    }

  } catch (error) {
    console.error('Profile image deletion error:', error);
    res.status(500).json({ 
      error: 'Failed to delete profile image',
      details: error.message 
    });
  }
});

module.exports = router; 