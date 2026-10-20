const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const rateLimit = require('express-rate-limit');
const { ObjectId } = require('mongodb');
const { recipeDb } = require('../config/mongoose');
const { generateCulturalInsight, answerCulturalQuestion, PRESET_QUESTIONS } = require('../config/openai');

// Each AI answer costs money, so cap questions per visitor
const askLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many questions', message: 'You have asked a lot of questions. Please try again in a few minutes.' }
});

// Preset answers are the same for everyone, so keep them for a day
const answerCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_QUESTION_LENGTH = 300;

const findRecipe = async (recipeId) => {
  const recipes = recipeDb.db.collection('recipes');
  if (ObjectId.isValid(recipeId)) {
    const recipe = await recipes.findOne({ _id: new ObjectId(recipeId) });
    if (recipe) return recipe;
  }
  return recipes.findOne({ _id: recipeId });
};

/**
 * @route POST /api/cultural/ask
 * @desc Ask a question about a recipe's culture: { recipeId, preset } or { recipeId, question }
 * @access Public (rate limited)
 */
router.post('/ask', askLimiter, async (req, res) => {
  try {
    const { recipeId, preset } = req.body || {};
    const freeText = typeof req.body?.question === 'string' ? req.body.question.trim() : '';

    if (!recipeId || typeof recipeId !== 'string') {
      return res.status(400).json({ error: 'Missing recipe', message: 'Choose a recipe first.' });
    }
    if (!preset && !freeText) {
      return res.status(400).json({ error: 'Missing question', message: 'Pick a question or type your own.' });
    }
    if (preset && !PRESET_QUESTIONS[preset]) {
      return res.status(400).json({ error: 'Unknown question', message: 'Pick one of the suggested questions.' });
    }
    if (freeText.length > MAX_QUESTION_LENGTH) {
      return res.status(400).json({ error: 'Question too long', message: `Keep your question under ${MAX_QUESTION_LENGTH} characters.` });
    }

    const cacheKey = preset ? `${recipeId}:${preset}` : null;
    const cached = cacheKey && answerCache.get(cacheKey);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return res.json({ success: true, question: PRESET_QUESTIONS[preset], answer: cached.answer, source: cached.source, cached: true });
    }

    const recipe = await findRecipe(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found', message: 'This recipe could not be found.' });
    }

    const question = preset ? PRESET_QUESTIONS[preset] : freeText;
    const { answer, source } = await answerCulturalQuestion(recipe, question);

    if (cacheKey && source === 'ai') {
      answerCache.set(cacheKey, { answer, source, at: Date.now() });
    }

    res.json({ success: true, question, answer, source, cached: false });
  } catch (error) {
    console.error('Cultural ask error:', error.message);
    res.status(502).json({
      error: 'AI unavailable',
      message: "Our AI couldn't answer right now. Try again in a moment."
    });
  }
});

/**
 * @route GET /api/cultural/insight/:recipeId
 * @desc Get cultural insights for a specific recipe
 * @access Public
 */
router.get('/insight/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    
    console.log('🔍 Getting cultural insight for recipe:', recipeId);
    
    // Find the recipe
    const recipe = await Recipe.findById(recipeId);
    
    if (!recipe) {
      return res.status(404).json({ 
        error: 'Recipe not found',
        message: 'The recipe you requested could not be found.'
      });
    }
    
    console.log('📖 Found recipe:', recipe.recipe_name || recipe.title);
    
    // Generate cultural insight using OpenAI
    const insight = await generateCulturalInsight(recipe);
    
    console.log('✨ Generated cultural insight successfully');
    
    res.json({
      success: true,
      recipe: {
        id: recipe._id,
        name: recipe.recipe_name || recipe.title,
        cuisine: recipe.cuisine
      },
      insight: insight,
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error generating cultural insight:', error);
    
    res.status(500).json({
      error: 'Failed to generate cultural insight',
      message: 'We encountered an issue while generating cultural insights. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route POST /api/cultural/insight
 * @desc Get cultural insights for a custom recipe (without saving to DB)
 * @access Public
 */
router.post('/insight', async (req, res) => {
  try {
    const { recipeName, cuisine, ingredients } = req.body;
    
    if (!recipeName || !cuisine) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Recipe name and cuisine are required.'
      });
    }
    
    console.log('🔍 Getting cultural insight for custom recipe:', recipeName);
    
    // Create a temporary recipe object
    const customRecipe = {
      recipe_name: recipeName,
      cuisine: cuisine,
      ingredients: ingredients || []
    };
    
    // Generate cultural insight
    const insight = await generateCulturalInsight(customRecipe);
    
    console.log('✨ Generated cultural insight for custom recipe successfully');
    
    res.json({
      success: true,
      recipe: {
        name: recipeName,
        cuisine: cuisine
      },
      insight: insight,
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error generating cultural insight for custom recipe:', error);
    
    res.status(500).json({
      error: 'Failed to generate cultural insight',
      message: 'We encountered an issue while generating cultural insights. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/cultural/health
 * @desc Health check for cultural insights service
 * @access Public
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Cultural Insights API',
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 