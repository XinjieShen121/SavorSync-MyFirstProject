const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth');
const { userDb } = require('../config/mongoose');

// Get community feed (posts from followed users and trending posts)
router.get('/feed', async (req, res) => {
  try {
    const postsCollection = userDb.db.collection('posts');
    
    // Get all posts with author information, sorted by creation date
    const posts = await postsCollection
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'authorData'
          }
        },
        {
          $unwind: '$authorData'
        },
        {
          $project: {
            _id: 1,
            title: 1,
            content: 1,
            image: 1,
            cuisine: 1,
            type: 1,
            likes: 1,
            createdAt: 1,
            author: {
              _id: '$authorData._id',
              name: '$authorData.name',
              avatar: '$authorData.avatar'
            }
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $limit: 50
        }
      ])
      .toArray();

    res.json({ posts });
  } catch (error) {
    console.error('Error fetching community feed:', error);
    res.status(500).json({ error: 'Failed to fetch community feed' });
  }
});

// Get trending posts (posts with most likes in the last 7 days)
router.get('/trending', async (req, res) => {
  try {
    const postsCollection = userDb.db.collection('posts');
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendingPosts = await postsCollection
      .aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'authorData'
          }
        },
        {
          $unwind: '$authorData'
        },
        {
          $project: {
            _id: 1,
            title: 1,
            content: 1,
            image: 1,
            cuisine: 1,
            type: 1,
            likes: 1,
            createdAt: 1,
            author: {
              _id: '$authorData._id',
              name: '$authorData.name',
              avatar: '$authorData.avatar'
            },
            likeCount: { $size: '$likes' }
          }
        },
        {
          $sort: { likeCount: -1, createdAt: -1 }
        },
        {
          $limit: 20
        }
      ])
      .toArray();

    res.json({ posts: trendingPosts });
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    res.status(500).json({ error: 'Failed to fetch trending posts' });
  }
});

// Search users
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const usersCollection = userDb.db.collection('users');

    if (!q || q.trim().length === 0) {
      return res.json({ users: [] });
    }

    const searchQuery = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    };

    const users = await usersCollection
      .find(searchQuery)
      .project({ password: 0 })
      .limit(10)
      .toArray();

    res.json({ users });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Get community stats
router.get('/stats', async (req, res) => {
  try {
    const usersCollection = userDb.db.collection('users');
    const postsCollection = userDb.db.collection('posts');

    const totalUsers = await usersCollection.countDocuments();
    const totalPosts = await postsCollection.countDocuments();
    
    // Get total likes across all posts
    const postsWithLikes = await postsCollection.find({}, { likes: 1 }).toArray();
    const totalLikes = postsWithLikes.reduce((sum, post) => sum + (post.likes ? post.likes.length : 0), 0);

    res.json({
      totalUsers,
      totalPosts,
      totalLikes
    });
  } catch (error) {
    console.error('Error fetching community stats:', error);
    res.status(500).json({ error: 'Failed to fetch community stats' });
  }
});

module.exports = router; 