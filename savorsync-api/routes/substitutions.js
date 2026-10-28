const express = require('express');
const rateLimit = require('express-rate-limit');
const { ObjectId } = require('mongodb');
const { recipeDb } = require('../config/mongoose');
const { getSubstitutions } = require('../config/substitutions');

const router = express.Router();

// The AI call costs money, so cap requests per visitor; results are cached per recipe
const swapLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests', message: 'Please try again in a few minutes.' }
});

const cache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * @route GET /api/substitutions/:recipeId
 * @desc Vegetarian, gluten-free and low-sodium swaps for each ingredient
 * @returns { swaps: [{ index, options: [{ diet, name, reason, matchKey }] }], source: 'ai' | 'fallback' }
 */
router.get('/:recipeId', swapLimiter, async (req, res) => {
  try {
    const { recipeId } = req.params;
    if (!ObjectId.isValid(recipeId)) {
      return res.status(400).json({ error: 'Invalid recipe', message: 'That recipe link looks wrong.' });
    }

    const cached = cache.get(recipeId);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return res.json({ ...cached.result, cached: true });
    }

    const recipe = await recipeDb.db.collection('recipes').findOne(
      { _id: new ObjectId(recipeId) },
      { projection: { recipe_name: 1, title: 1, cuisine: 1, ingredients: 1 } }
    );
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found', message: "We couldn't find that recipe." });
    }

    const result = await getSubstitutions(recipe);
    // Only cache AI answers, so a later request can still upgrade a fallback
    if (result.source === 'ai') cache.set(recipeId, { at: Date.now(), result });
    res.json(result);
  } catch (error) {
    console.error('Substitutions error:', error);
    res.status(502).json({ error: 'Swaps unavailable', message: "Couldn't load swaps right now. Please try again." });
  }
});

module.exports = router;
