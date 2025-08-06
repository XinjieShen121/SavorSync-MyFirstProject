const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const { generateCulturalInsight } = require('../config/openai');

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