const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth');
const { userDb } = require('../config/mongoose');

// Get user profile by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usersCollection = userDb.db.collection('users');

    const user = await usersCollection.findOne({ _id: new require('mongodb').ObjectId(id) });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove sensitive information
    const { password, ...userProfile } = user;
    res.json({ user: userProfile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Follow/Unfollow user (requires authentication)
router.put('/:id/follow', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;
    const usersCollection = userDb.db.collection('users');

    // Can't follow yourself
    if (currentUserId === id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const targetUser = await usersCollection.findOne({ _id: new require('mongodb').ObjectId(id) });
    const currentUser = await usersCollection.findOne({ _id: new require('mongodb').ObjectId(currentUserId) });

    if (!targetUser || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isFollowing = currentUser.following && currentUser.following.includes(id);
    const isFollowedBy = targetUser.followers && targetUser.followers.includes(currentUserId);

    if (isFollowing) {
      // Unfollow
      await usersCollection.updateOne(
        { _id: new require('mongodb').ObjectId(currentUserId) },
        { $pull: { following: id } }
      );
      await usersCollection.updateOne(
        { _id: new require('mongodb').ObjectId(id) },
        { $pull: { followers: currentUserId } }
      );
    } else {
      // Follow
      await usersCollection.updateOne(
        { _id: new require('mongodb').ObjectId(currentUserId) },
        { $addToSet: { following: id } }
      );
      await usersCollection.updateOne(
        { _id: new require('mongodb').ObjectId(id) },
        { $addToSet: { followers: currentUserId } }
      );
    }

    // Get updated current user
    const updatedCurrentUser = await usersCollection.findOne({ _id: new require('mongodb').ObjectId(currentUserId) });
    const { password, ...userProfile } = updatedCurrentUser;

    res.json({ 
      user: userProfile,
      isFollowing: !isFollowing 
    });
  } catch (error) {
    console.error('Error toggling follow:', error);
    res.status(500).json({ error: 'Failed to toggle follow' });
  }
});

// Get user's followers
router.get('/:id/followers', async (req, res) => {
  try {
    const { id } = req.params;
    const usersCollection = userDb.db.collection('users');

    const user = await usersCollection.findOne({ _id: new require('mongodb').ObjectId(id) });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followers = user.followers || [];
    
    if (followers.length === 0) {
      return res.json({ users: [] });
    }

    const followersData = await usersCollection
      .find({ _id: { $in: followers.map(id => new require('mongodb').ObjectId(id)) } })
      .project({ password: 0 })
      .toArray();

    res.json({ users: followersData });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

// Get user's following
router.get('/:id/following', async (req, res) => {
  try {
    const { id } = req.params;
    const usersCollection = userDb.db.collection('users');

    const user = await usersCollection.findOne({ _id: new require('mongodb').ObjectId(id) });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const following = user.following || [];
    
    if (following.length === 0) {
      return res.json({ users: [] });
    }

    const followingData = await usersCollection
      .find({ _id: { $in: following.map(id => new require('mongodb').ObjectId(id)) } })
      .project({ password: 0 })
      .toArray();

    res.json({ users: followingData });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

// Get user's friends (mutual follows)
router.get('/:id/friends', async (req, res) => {
  try {
    const { id } = req.params;
    const usersCollection = userDb.db.collection('users');

    const user = await usersCollection.findOne({ _id: new require('mongodb').ObjectId(id) });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const following = user.following || [];
    const followers = user.followers || [];
    
    // Find mutual follows
    const friends = following.filter(followingId => followers.includes(followingId));
    
    if (friends.length === 0) {
      return res.json({ users: [] });
    }

    const friendsData = await usersCollection
      .find({ _id: { $in: friends.map(id => new require('mongodb').ObjectId(id)) } })
      .project({ password: 0 })
      .toArray();

    res.json({ users: friendsData });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

// Get user's posts
router.get('/:id/posts', async (req, res) => {
  try {
    const { id } = req.params;
    const postsCollection = userDb.db.collection('posts');

    const posts = await postsCollection
      .find({ author: new require('mongodb').ObjectId(id) })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ posts });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

// Update user profile (requires authentication)
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, avatar, bio } = req.body;
    const usersCollection = userDb.db.collection('users');

    const updateData = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;
    if (bio) updateData.bio = bio;

    const result = await usersCollection.updateOne(
      { _id: new require('mongodb').ObjectId(req.user.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get updated user
    const updatedUser = await usersCollection.findOne({ _id: new require('mongodb').ObjectId(req.user.id) });
    const { password, ...userProfile } = updatedUser;

    res.json({ user: userProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router; 