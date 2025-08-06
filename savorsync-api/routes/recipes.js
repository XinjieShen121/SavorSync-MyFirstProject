const express = require('express');
const { recipeDb } = require('../config/mongoose');
const { authenticateToken } = require('../middleware/auth');

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
    
    const recipe = await recipesCollection.findOne(query);
    
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
router.put('/:recipeId/videos', async (req, res) => {
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
    
    const recipes = await recipesCollection.find(searchQuery).toArray();
    
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
    
    const recipes = await recipesCollection.find({
      $or: [
        { title: { $regex: new RegExp(query, 'i') } },
        { subtitle: { $regex: new RegExp(query, 'i') } },
        { tags: { $in: [new RegExp(query, 'i')] } },
        { cuisine: { $regex: new RegExp(query, 'i') } }
      ]
    }).toArray();

    res.json(recipes);
  } catch (error) {
    console.error('Search recipes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate recipe (placeholder for future AI integration)
router.post('/generate', async (req, res) => {
  try {
    const { recipe_name, cuisine, save_to_database } = req.body;
    
    // For now, return a mock generated recipe
    const mockRecipe = {
      title: recipe_name,
      subtitle: `Generated ${cuisine} recipe`,
      cuisine: cuisine,
      region: 'Generated',
      culturalBackground: `A generated ${cuisine} recipe created just for you.`,
      ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
      instructions: ['Step 1', 'Step 2', 'Step 3'],
      prepTime: '30 minutes',
      cookTime: '45 minutes',
      servings: 4,
      difficulty: 'Medium',
      tags: [cuisine.toLowerCase(), 'generated'],
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop'
    };

    if (save_to_database) {
      // Use the real MongoDB collection directly
      const recipesCollection = recipeDb.db.collection('recipes');
      const result = await recipesCollection.insertOne(mockRecipe);
      mockRecipe._id = result.insertedId;
      res.json({ message: 'Recipe generated and saved', recipe: mockRecipe });
    } else {
      res.json({ message: 'Recipe generated', recipe: mockRecipe });
    }
  } catch (error) {
    console.error('Generate recipe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Favorite a recipe
router.post('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Use the real MongoDB collection directly
    const recipesCollection = recipeDb.db.collection('recipes');
    const recipe = await recipesCollection.findOne({ _id: id });

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Here you would typically update the user's favorites
    // For now, just return success
    res.json({ message: 'Recipe favorited successfully' });
  } catch (error) {
    console.error('Favorite recipe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
