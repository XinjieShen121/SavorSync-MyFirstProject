const express = require('express');
const { recipeDb } = require('../config/mongoose');
const { authenticateToken } = require('../middleware/auth');
const { ObjectId } = require('mongodb');
const User = require('../models/User');

const toObjectId = (id) => (ObjectId.isValid(id) ? new ObjectId(id) : null);
const rateLimit = require('express-rate-limit');
const { generateRecipe, parseRequest } = require('../config/recipeGenerator');

// AI recipes visitors create stay out of the shared catalogue; they are reachable
// by link once saved, and from the creator's own "My recipes".
const PUBLIC_ONLY = { generated: { $ne: true } };
const publicQuery = (query) => (Object.keys(query).length ? { $and: [query, PUBLIC_ONLY] } : PUBLIC_ONLY);

const router = express.Router();

// Get all unique cuisines from real MongoDB
router.get('/cuisines', async (req, res) => {
  try {
    // Use the real MongoDB collection directly
    const recipesCollection = recipeDb.db.collection('recipes');
    
    // Get distinct cuisines and sort them alphabetically
    const cuisines = await recipesCollection.distinct('cuisine');
    const sortedCuisines = cuisines.sort();
    
    console.log(`🌍 Found ${sortedCuisines.length} unique cuisines:`, sortedCuisines);
    
    res.json(sortedCuisines);
  } catch (error) {
    console.error('Get cuisines error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all recipes from real MongoDB with optional cuisine filter
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const { cuisine } = req.query;

    // Use the real MongoDB collection directly
    const recipesCollection = recipeDb.db.collection('recipes');
    
    // Build query based on filters
    let query = {};
    if (cuisine && cuisine !== 'all') {
      // Handle special cases for broad categories
      if (cuisine.toLowerCase() === 'asian') {
        query = {
          $or: [
            { cuisine: { $in: ["Japanese", "Chinese", "Korean", "Thai", "Vietnamese", "Indian"] } },
            { region: 'Asian' },
            { tags: { $in: [/asian/i, /japanese/i, /chinese/i, /korean/i, /thai/i, /vietnamese/i] } }
          ]
        };
      } else if (cuisine.toLowerCase() === 'mediterranean') {
        query = {
          $or: [
            { cuisine: { $in: ['Greek', 'Spanish', 'Italian'] } },
            { region: 'Mediterranean' },
            { tags: { $in: [/mediterranean/i, /greek/i, /spanish/i, /italian/i] } }
          ]
        };
      } else if (cuisine.toLowerCase() === 'latin') {
        query = {
          $or: [
            { cuisine: { $in: ['Mexican'] } },
            { region: 'Latin' },
            { tags: { $in: [/latin/i, /mexican/i] } }
          ]
        };
      } else if (cuisine.toLowerCase() === 'indian') {
        // For "Indian", search in cuisine field and tags
        query = {
          $or: [
            { cuisine: { $regex: new RegExp('indian', 'i') } },
            { tags: { $in: [/indian/i, /curry/i, /spice/i] } }
          ]
        };
      } else {
        // For specific cuisines, search in cuisine field and tags
        query = {
          $or: [
            { cuisine: { $regex: new RegExp(cuisine, 'i') } },
            { tags: { $in: [new RegExp(cuisine, 'i')] } }
          ]
        };
      }
    }
    
    query = publicQuery(query);
    const totalRecipes = await recipesCollection.countDocuments(query);
    
    // If no pagination parameters are provided, return all recipes
    if (!req.query.page && !req.query.limit) {
      const allRecipes = await recipesCollection.find(query).toArray();
      console.log(`📊 Returning all ${allRecipes.length} recipes (no pagination)`);
      return res.json(allRecipes);
    }
    
    const recipes = await recipesCollection
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    res.json({
      recipes,
      pagination: {
        current: page,
        total: Math.ceil(totalRecipes / limit),
        hasMore: skip + recipes.length < totalRecipes
      }
    });
  } catch (error) {
    console.error('Get all recipes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Recipes the signed-in user created with "Cook with what I have", newest first
router.get('/mine', authenticateToken, async (req, res) => {
  try {
    const recipes = await recipeDb.db.collection('recipes')
      .find({ generated: true, draft: false, createdBy: String(req.user._id) })
      .sort({ savedAt: -1 })
      .limit(100)
      .toArray();
    res.json({ recipes });
  } catch (error) {
    console.error('Get my recipes error:', error);
    res.status(500).json({ error: "Couldn't load your recipes. Please try again." });
  }
});

// The signed-in user's favorite recipes, newest first
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const ids = (req.user.favorites || []).filter(id => ObjectId.isValid(id));
    const recipes = await recipeDb.db.collection('recipes')
      .find({ _id: { $in: ids.map(id => new ObjectId(id)) } })
      .toArray();

    const order = new Map(ids.map((id, index) => [id, index]));
    recipes.sort((a, b) => order.get(String(b._id)) - order.get(String(a._id)));

    res.json({ recipes });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Couldn\'t load your favorites. Please try again.' });
  }
});

// Get single recipe by ID
router.get('/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const recipesCollection = recipeDb.db.collection('recipes');
    
    // Convert string ID to ObjectId if needed
    const { ObjectId } = require('mongodb');
    let query;
    
    try {
      query = { _id: new ObjectId(recipeId) };
    } catch (err) {
      // If ObjectId conversion fails, try string match
      query = { _id: recipeId };
    }
    
    const recipe = await recipesCollection.findOne({ ...query, draft: { $ne: true } });
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    console.log(`📋 Found recipe: ${recipe.title || recipe.recipe_name}`);
    console.log(`🎥 Video URLs for ${recipe.title || recipe.recipe_name}:`, {
      shortform_video_url: recipe.shortform_video_url,
      longform_video_url: recipe.longform_video_url,
      has_shortform: !!recipe.shortform_video_url,
      has_longform: !!recipe.longform_video_url
    });
    res.json(recipe);
  } catch (error) {
    console.error('Get recipe by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update recipe video URLs
router.put('/:recipeId/videos', authenticateToken, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { shortform_video_url, longform_video_url } = req.body;
    const recipesCollection = recipeDb.db.collection('recipes');
    
    // Convert string ID to ObjectId if needed
    const { ObjectId } = require('mongodb');
    let query;
    
    try {
      query = { _id: new ObjectId(recipeId) };
    } catch (err) {
      // If ObjectId conversion fails, try string match
      query = { _id: recipeId };
    }
    
    const updateData = {};
    if (shortform_video_url) updateData.shortform_video_url = shortform_video_url;
    if (longform_video_url) updateData.longform_video_url = longform_video_url;
    
    const result = await recipesCollection.findOneAndUpdate(
      query,
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result.value) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    console.log(`✅ Updated video URLs for recipe: ${result.value.title}`);
    res.json(result.value);
  } catch (error) {
    console.error('Update recipe videos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Get recipes by cuisine from real MongoDB
router.get('/cuisine/:cuisine', async (req, res) => {
  try {
    const { cuisine } = req.params;
    
    // Use the real MongoDB collection directly
    const recipesCollection = recipeDb.db.collection('recipes');
    
    // Handle special cases for broad categories
    let searchQuery = {};
    
    if (cuisine.toLowerCase() === 'asian') {
      // For "Asian", search in both cuisine and region fields
      searchQuery = {
        $or: [
          { cuisine: { $in: ["Japanese", "Chinese", "Korean", "Thai", "Vietnamese", "Indian"] } },
          { region: 'Asian' },
          { tags: { $in: [/asian/i, /japanese/i, /chinese/i, /korean/i, /thai/i, /vietnamese/i] } }
        ]
      };
    } else if (cuisine.toLowerCase() === 'mediterranean') {
      // For "Mediterranean", search in both cuisine and region fields
      searchQuery = {
        $or: [
          { cuisine: { $in: ['Greek', 'Spanish', 'Italian'] } },
          { region: 'Mediterranean' },
          { tags: { $in: [/mediterranean/i, /greek/i, /spanish/i, /italian/i] } }
        ]
      };
    } else if (cuisine.toLowerCase() === 'latin') {
      // For "Latin", search in both cuisine and region fields
      searchQuery = {
        $or: [
          { cuisine: { $in: ['Mexican'] } },
          { region: 'Latin' },
          { tags: { $in: [/latin/i, /mexican/i] } }
        ]
      };
    } else if (cuisine.toLowerCase() === 'american') {
      // For "American", search for American cuisine
      searchQuery = {
        $or: [
          { cuisine: 'American' },
          { region: 'American' },
          { tags: { $in: [/american/i, /comfort/i] } }
        ]
      };
    } else if (['southern', 'tex-mex', 'cajun', 'new england', 'california', 'midwest'].includes(cuisine.toLowerCase())) {
      // For American regional cuisines, search by region field
      searchQuery = {
        $or: [
          { region: { $regex: new RegExp(cuisine, 'i') } },
          { cuisine: 'American', region: { $regex: new RegExp(cuisine, 'i') } },
          { tags: { $in: [new RegExp(cuisine.replace(/[-\s]/g, '[-\\s]*'), 'i')] } }
        ]
      };
    } else if (cuisine.toLowerCase() === 'indian') {
      // For "Indian", search in cuisine field and tags
      searchQuery = {
        $or: [
          { cuisine: { $regex: new RegExp('indian', 'i') } },
          { tags: { $in: [/indian/i, /curry/i, /spice/i] } }
        ]
      };
    } else {
      // For specific cuisines, search in cuisine field and tags
      searchQuery = {
        $or: [
          { cuisine: { $regex: new RegExp(cuisine, 'i') } },
          { tags: { $in: [new RegExp(cuisine, 'i')] } }
        ]
      };
    }
    
    console.log(`🔍 Searching for cuisine: ${cuisine}`);
    console.log(`📋 Search query:`, JSON.stringify(searchQuery, null, 2));
    
    const recipes = await recipesCollection.find(publicQuery(searchQuery)).toArray();
    
    console.log(`📊 Found ${recipes.length} recipes for ${cuisine}`);
    
    res.json(recipes);
  } catch (error) {
    console.error('Get recipes by cuisine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search recipes from real MongoDB
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Use the real MongoDB collection directly
    const recipesCollection = recipeDb.db.collection('recipes');
    
    const recipes = await recipesCollection.find(publicQuery({
      $or: [
        { title: { $regex: new RegExp(query, 'i') } },
        { subtitle: { $regex: new RegExp(query, 'i') } },
        { tags: { $in: [new RegExp(query, 'i')] } },
        { cuisine: { $regex: new RegExp(query, 'i') } }
      ]
    })).toArray();

    res.json(recipes);
  } catch (error) {
    console.error('Search recipes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Each AI recipe costs money, so cap how many one visitor can make
const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many recipes', message: "You've made a lot of recipes this hour. Please try again later." }
});

// Cook with what I have: write a recipe from the visitor's ingredients.
// It is stored as a draft so saving it later never trusts content from the browser.
router.post('/generate', authenticateToken, generateLimiter, async (req, res) => {
  try {
    const request = parseRequest(req.body);
    const recipe = await generateRecipe(request);
    const draft = {
      ...recipe,
      generated: true,
      draft: true,
      createdBy: String(req.user._id),
      createdAt: new Date(),
      requestedIngredients: request.ingredients,
    };
    const result = await recipeDb.db.collection('recipes').insertOne(draft);
    res.json({ recipe: { ...draft, _id: result.insertedId } });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: 'Generate failed', message: error.message });
    }
    console.error('Generate recipe error:', error);
    res.status(502).json({ error: 'Generate failed', message: "Couldn't create a recipe right now. Please try again." });
  }
});

// Keep a generated draft: it then has a shareable page and shows in "My recipes"
router.post('/generated/:id/save', authenticateToken, async (req, res) => {
  try {
    const objectId = toObjectId(req.params.id);
    if (!objectId) {
      return res.status(400).json({ error: 'Invalid recipe', message: 'That recipe link looks wrong.' });
    }
    const result = await recipeDb.db.collection('recipes').findOneAndUpdate(
      { _id: objectId, generated: true, createdBy: String(req.user._id) },
      { $set: { draft: false, savedAt: new Date() } },
      { returnDocument: 'after' }
    );
    const recipe = result && result.value !== undefined ? result.value : result;
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found', message: "We couldn't find that recipe." });
    }
    res.json({ recipe });
  } catch (error) {
    console.error('Save generated recipe error:', error);
    res.status(500).json({ error: 'Save failed', message: "Couldn't save this recipe. Please try again." });
  }
});

// Favorites: a signed-in user's saved recipe ids live on their user document
// Save a recipe to the signed-in user's favorites
router.post('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const objectId = toObjectId(req.params.id);
    if (!objectId) {
      return res.status(400).json({ error: 'That recipe link looks wrong.' });
    }

    const recipe = await recipeDb.db.collection('recipes').findOne({ _id: objectId }, { projection: { _id: 1 } });
    if (!recipe) {
      return res.status(404).json({ error: 'We couldn\'t find that recipe.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { favorites: req.params.id } },
      { new: true }
    ).select('favorites');

    res.json({ favorites: user.favorites });
  } catch (error) {
    console.error('Favorite recipe error:', error);
    res.status(500).json({ error: 'Couldn\'t save this recipe. Please try again.' });
  }
});

// Remove a recipe from the signed-in user's favorites
router.delete('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { favorites: req.params.id } },
      { new: true }
    ).select('favorites');

    res.json({ favorites: user.favorites });
  } catch (error) {
    console.error('Unfavorite recipe error:', error);
    res.status(500).json({ error: 'Couldn\'t remove this recipe. Please try again.' });
  }
});

module.exports = router;
