const express = require('express');
const rateLimit = require('express-rate-limit');
const { ObjectId } = require('mongodb');
const { recipeDb } = require('../config/mongoose');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// "I made this" reviews: one per cook per recipe, with a 1-5 rating, an
// optional note and an optional photo uploaded through /api/upload/image.
const reviews = () => recipeDb.db.collection('reviews');
const MAX_TEXT = 1000;
const IMAGE_HOST = /^https:\/\/res\.cloudinary\.com\//;

const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many reviews', message: 'Please try again in a few minutes.' }
});

const recipeExists = async (recipeId) => {
  if (!ObjectId.isValid(recipeId)) return false;
  const recipe = await recipeDb.db.collection('recipes').findOne(
    { _id: new ObjectId(recipeId), draft: { $ne: true } },
    { projection: { _id: 1 } }
  );
  return !!recipe;
};

const summarize = (list) => {
  const count = list.length;
  const average = count ? Math.round((list.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10 : null;
  return { count, average };
};

/**
 * @route GET /api/reviews/recipe/:recipeId
 * @returns { reviews: [...newest first], summary: { count, average } }
 */
router.get('/recipe/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    if (!ObjectId.isValid(recipeId)) {
      return res.status(400).json({ error: 'Invalid recipe', message: 'That recipe link looks wrong.' });
    }
    const list = await reviews().find({ recipeId }).sort({ updatedAt: -1 }).limit(200).toArray();
    res.json({ reviews: list, summary: summarize(list) });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Reviews unavailable', message: "Couldn't load reviews. Please try again." });
  }
});

/**
 * @route POST /api/reviews/recipe/:recipeId
 * @desc Add or update the signed-in cook's review: { rating, text?, imageUrl? }
 */
router.post('/recipe/:recipeId', authenticateToken, reviewLimiter, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const rating = Number(req.body?.rating);
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    const imageUrl = typeof req.body?.imageUrl === 'string' ? req.body.imageUrl.trim() : '';

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating', message: 'Choose 1 to 5 stars.' });
    }
    if (text.length > MAX_TEXT) {
      return res.status(400).json({ error: 'Too long', message: `Keep your note under ${MAX_TEXT} characters.` });
    }
    if (imageUrl && !IMAGE_HOST.test(imageUrl)) {
      return res.status(400).json({ error: 'Invalid photo', message: 'Please upload the photo again.' });
    }
    if (!(await recipeExists(recipeId))) {
      return res.status(404).json({ error: 'Recipe not found', message: "We couldn't find that recipe." });
    }

    const userId = String(req.user._id);
    const now = new Date();
    await reviews().updateOne(
      { recipeId, userId },
      {
        $set: {
          rating,
          text,
          imageUrl: imageUrl || null,
          userName: req.user.name,
          userAvatar: req.user.avatar || null,
          updatedAt: now,
        },
        $setOnInsert: { recipeId, userId, createdAt: now },
      },
      { upsert: true }
    );
    const review = await reviews().findOne({ recipeId, userId });
    res.json({ review });
  } catch (error) {
    console.error('Save review error:', error);
    res.status(500).json({ error: 'Save failed', message: "Couldn't save your review. Please try again." });
  }
});

/**
 * @route DELETE /api/reviews/recipe/:recipeId
 * @desc Remove the signed-in cook's own review
 */
router.delete('/recipe/:recipeId', authenticateToken, async (req, res) => {
  try {
    await reviews().deleteOne({ recipeId: req.params.recipeId, userId: String(req.user._id) });
    res.json({ deleted: true });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Delete failed', message: "Couldn't remove your review. Please try again." });
  }
});

module.exports = router;
module.exports.summarize = summarize;
