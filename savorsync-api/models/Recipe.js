


const mongoose = require('mongoose');
const { recipeDb } = require('../config/mongoose');

const recipeSchema = new mongoose.Schema({
  recipe_name: {
    type: String,
    required: [true, 'Recipe name is required'],
    trim: true
  },
  cuisine: {
    type: String,
    required: [true, 'Cuisine is required'],
    enum: [
      'Italian', 'Indian', 'Chinese', 'Mexican', 'Japanese', 'French', 
      'Thai', 'Greek', 'Spanish', 'Korean', 'Lebanese', 'Vietnamese',
      'American', 'Mediterranean', 'Asian', 'Latin'
    ]
  },
  region: {
    type: String,
    trim: true
  },
  prep_time: String,
  cook_time: String,
  servings: Number,
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  image: {
    type: String,
    default: '/api/placeholder/600/400'
  },
  image_url: String,
  shortform_video_url: String,
  longform_video_url: String,
  fun_facts: [String],
  ingredients: [{
    type: String,
    required: [true, 'Ingredients are required']
  }],
  instructions: [{
    type: String,
    required: [true, 'Instructions are required']
  }],
  tags: [String],
  substitutions: [{
    original: String,
    substitute: String,
    reason: String
  }],
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number
  },
  cookingTips: [String],
  servingSuggestions: [String],
  isVegetarian: { type: Boolean, default: false },
  isVegan: { type: Boolean, default: false },
  isGlutenFree: { type: Boolean, default: false },
  spiceLevel: {
    type: String,
    enum: ['Mild', 'Medium', 'Hot', 'Very Hot'],
    default: 'Medium'
  }
}, {
  timestamps: true
});

// Indexes for better performance
recipeSchema.index({ cuisine: 1 });
recipeSchema.index({ region: 1 });
recipeSchema.index({ tags: 1 });
recipeSchema.index({ title: 'text', culturalBackground: 'text' });



module.exports = recipeDb.model('Recipe', recipeSchema);