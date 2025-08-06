const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const { authenticateToken } = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

/**
 * POSTS CRUD API ROUTES
 * 
 * 📝 CREATE: POST /api/posts
 * 📖 READ: GET /api/posts, GET /api/posts/:id, GET /api/posts/user/:userId
 * ✏️ UPDATE: PUT /api/posts/:id
 * ❌ DELETE: DELETE /api/posts/:id
 * 
 * All routes use JWT authentication and proper error handling
 */

// Validation middleware
const validatePost = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Content must be between 10 and 10000 characters'),
  body('category')
    .isIn(['recipe', 'cooking-tip', 'restaurant-review', 'food-story', 'technique'])
    .withMessage('Invalid category'),
  body('type')
    .optional()
    .isIn(['recipe', 'story'])
    .withMessage('Type must be either "recipe" or "story"'),
  body('cuisine')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Cuisine must be between 1 and 50 characters'),
  body('tags')
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
  body('tags.*')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters')
];

const validateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
];

/**
 * 📖 READ: Get all posts with pagination and filtering
 * GET /api/posts
 * Query params: page, limit, category, author, search
 * Returns: { posts: [], pagination: {} }
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const author = req.query.author;
    const search = req.query.search;

    let query = { isPublished: true, isDeleted: false };

    if (category) {
      query.category = category;
    }

    if (author) {
      query.author = { $regex: author, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('authorId', 'name avatar');

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasMore: skip + posts.length < total,
        totalPosts: total
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get trending posts
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const timeframe = req.query.timeframe || 'week';

    const posts = await Post.getTrendingPosts(limit, timeframe);
    res.json({ posts });
  } catch (error) {
    console.error('Get trending posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search posts
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;

    const options = { page, limit, category };
    const posts = await Post.searchPosts(query, options);

    res.json({ posts });
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 📖 READ: Get all posts by a specific user
 * GET /api/posts/user/:userId
 * Query params: page, limit
 * Returns: { posts: [], pagination: {} }
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      authorId: req.params.userId,
      isPublished: true,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('authorId', 'name avatar');

    const total = await Post.countDocuments({
      authorId: req.params.userId,
      isPublished: true,
      isDeleted: false
    });

    res.json({
      posts,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasMore: skip + posts.length < total,
        totalPosts: total
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 📖 READ: Get a single post by ID
 * GET /api/posts/:id
 * Returns: { post: {} }
 */
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      isPublished: true,
      isDeleted: false
    }).populate('authorId', 'name avatar');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 📝 CREATE: Create a new post
 * POST /api/posts
 * Auth: Required (JWT)
 * Body: { title, content, image?, type?, cuisine?, tags?, category }
 * Returns: { message: string, post: {} }
 */
router.post('/', authenticateToken, validatePost, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { title, content, image, tags, category, type, cuisine } = req.body;

    let imageUrl = null;
    
    // Handle image upload to Cloudinary if image data is provided
    if (image && image.startsWith('data:image')) {
      try {
        console.log('🖼️ Starting Cloudinary upload...');
        console.log('📊 Image data length:', image.length);
        
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: 'savorsync/posts',
          resource_type: 'auto',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' }
          ]
        });
        imageUrl = uploadResponse.secure_url;
        console.log('✅ Image uploaded to Cloudinary:', imageUrl);
      } catch (uploadError) {
        console.error('❌ Cloudinary upload error:', uploadError);
        console.error('❌ Error details:', {
          message: uploadError.message,
          http_code: uploadError.http_code,
          name: uploadError.name
        });
        
        // Check if it's a configuration issue
        if (uploadError.message.includes('Invalid api_key') || uploadError.message.includes('Invalid cloud_name')) {
          console.log('⚠️ Cloudinary config error - creating post without image');
          imageUrl = null; // Continue without image
        } else {
          console.log('⚠️ Cloudinary upload failed - creating post without image');
          imageUrl = null; // Continue without image
        }
      }
    } else if (image && image.startsWith('http')) {
      // If it's already a URL, use it directly
      imageUrl = image;
      console.log('🔗 Using existing image URL:', imageUrl);
    }

    const newPost = new Post({
      title,
      content,
      image: imageUrl,
      tags: tags || [],
      category,
      type: type || (category === 'recipe' || category === 'technique' ? 'recipe' : 'story'),
      cuisine: cuisine || null,
      author: req.user.name,
      authorId: req.user._id
    });

    await newPost.save();

    // Populate author info before sending response
    await newPost.populate('authorId', 'name avatar');

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * ✏️ UPDATE: Update a post
 * PUT /api/posts/:id
 * Auth: Required (JWT) + Ownership
 * Body: { title?, content?, image?, type?, cuisine?, tags?, category? }
 * Returns: { message: string, post: {} }
 */
router.put('/:id', authenticateToken, validatePost, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const post = await Post.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user owns the post
    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'Forbidden: You can only update your own posts',
        message: 'You do not have permission to update this post'
      });
    }

    const { title, content, image, tags, category, type, cuisine } = req.body;

    let imageUrl = post.image; // Keep existing image by default
    
    // Handle image upload to Cloudinary if new image data is provided
    if (image && image.startsWith('data:image')) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: 'savorsync/posts',
          resource_type: 'auto',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' }
          ]
        });
        imageUrl = uploadResponse.secure_url;
        console.log('✅ Image uploaded to Cloudinary:', imageUrl);
      } catch (uploadError) {
        console.error('❌ Cloudinary upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload image' });
      }
    } else if (image && image.startsWith('http')) {
      // If it's already a URL, use it directly
      imageUrl = image;
    }

    // Update post fields
    post.title = title;
    post.content = content;
    post.image = imageUrl;
    post.tags = tags || [];
    post.category = category;
    post.type = type || post.type; // Keep existing type or set new one
    post.cuisine = cuisine || post.cuisine; // Keep existing cuisine or set new one

    await post.save();
    await post.populate('authorId', 'name avatar');

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * ❌ DELETE: Delete a post (soft delete)
 * DELETE /api/posts/:id
 * Auth required, only post author can delete
 * Returns: { message: string, postId: string }
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('DELETE: Attempting to delete post:', req.params.id);
    console.log('DELETE: User ID:', req.user._id);
    console.log('DELETE: User name:', req.user.name);
    
    const post = await Post.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    console.log('DELETE: Found post:', post ? 'Yes' : 'No');
    if (post) {
      console.log('DELETE: Post author ID:', post.authorId);
      console.log('DELETE: Post author name:', post.author);
    }

    if (!post) {
      console.log('DELETE: Post not found');
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user owns the post
    console.log('DELETE: Comparing authorId:', post.authorId.toString(), 'with user ID:', req.user._id.toString());
    console.log('DELETE: User object:', { _id: req.user._id, id: req.user.id });
    
    // Handle both _id and id formats
    const userOwnsPost = post.authorId.toString() === req.user._id.toString() || 
                        post.authorId.toString() === req.user.id?.toString();
    
    if (!userOwnsPost) {
      console.log('DELETE: Authorization failed - user does not own post');
      return res.status(403).json({ 
        error: 'Forbidden: You can only delete your own posts',
        message: 'You do not have permission to delete this post'
      });
    }

    console.log('DELETE: Authorization successful, performing soft delete');
    // Soft delete
    post.isDeleted = true;
    await post.save();

    console.log('DELETE: Post deleted successfully');
    res.json({ 
      message: 'Post deleted successfully',
      postId: post._id
    });
  } catch (error) {
    console.error('DELETE: Delete post error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Like/Unlike a post (requires authentication)
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      isPublished: true,
      isDeleted: false
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const wasLiked = post.toggleLike(req.user._id);
    await post.save();

    res.json({
      message: wasLiked ? 'Post liked' : 'Post unliked',
      liked: wasLiked,
      likeCount: post.likes.length
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove like from a post (requires authentication)
router.delete('/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      isPublished: true,
      isDeleted: false
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const wasLiked = post.toggleLike(req.user._id);
    await post.save();

    res.json({
      message: 'Post unliked',
      liked: false,
      likeCount: post.likes.length
    });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a comment to a post (requires authentication)
router.post('/:id/comments', authenticateToken, validateComment, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const post = await Post.findOne({
      _id: req.params.id,
      isPublished: true,
      isDeleted: false
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const commentData = {
      content: req.body.content,
      author: req.user.name,
      authorId: req.user._id
    };

    await post.addComment(commentData);

    res.status(201).json({
      message: 'Comment added successfully',
      comment: post.comments[post.comments.length - 1]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      isPublished: true,
      isDeleted: false
    }).select('comments');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ comments: post.comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a comment (requires authentication and ownership)
router.delete('/:id/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      isPublished: true,
      isDeleted: false
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment or the post
    if (comment.authorId.toString() !== req.user._id.toString() && 
        post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You do not have permission to delete this comment' });
    }

    await post.removeComment(req.params.commentId);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 