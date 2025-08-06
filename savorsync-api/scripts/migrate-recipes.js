require('dotenv').config();
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');

// Your recipe data from the Python script
const RECIPE_DATA = {
  "Italian": [
    {
      title: "Spaghetti Carbonara",
      subtitle: "Classic Roman pasta with eggs and pancetta",
      cuisine: "Italian",
      region: "European",
      culturalBackground: "Carbonara originated in Rome during WWII when American soldiers brought eggs and bacon, which locals combined with pasta.",
      ingredients: [
        "1 pound spaghetti",
        "4 large eggs",
        "1/2 cup grated Pecorino Romano cheese",
        "1/2 cup grated Parmigiano-Reggiano",
        "4 ounces pancetta or guanciale, diced",
        "4 cloves garlic, minced",
        "Black pepper to taste",
        "Salt for pasta water"
      ],
      instructions: [
        "Bring a large pot of salted water to boil",
        "Cook spaghetti according to package directions",
        "Meanwhile, cook pancetta in a large skillet until crispy",
        "In a bowl, whisk together eggs, cheeses, and black pepper",
        "Drain pasta, reserving 1 cup of pasta water",
        "Add hot pasta to skillet with pancetta",
        "Remove from heat and quickly stir in egg mixture",
        "Add pasta water as needed to create a creamy sauce",
        "Serve immediately with extra cheese and black pepper"
      ],
      prepTime: "10 minutes",
      cookTime: "15 minutes",
      servings: 4,
      difficulty: "Medium",
      tags: ["pasta", "italian", "eggs", "quick"]
    }
    // Add more Italian recipes...
  ]
  // Add more cuisines...
};

const migrateRecipes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing recipes
    await Recipe.deleteMany({});
    console.log('Cleared existing recipes');
    
    // Insert new recipes
    for (const [cuisine, recipes] of Object.entries(RECIPE_DATA)) {
      for (const recipe of recipes) {
        await Recipe.create(recipe);
        console.log(`Added: ${recipe.title}`);
      }
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateRecipes();