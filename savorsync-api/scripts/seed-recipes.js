// Fills the recipe database (RECIPE_MONGODB_URI) with starter recipes.
// Safe to run more than once: recipes that already exist (same recipe_name) are left untouched.
// Usage, from savorsync-api: npm run seed-recipes
// To see which database it would write to, without writing anything:
//   npm run seed-recipes -- --dry-run
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

if (!process.env.MONGODB_URI || !process.env.RECIPE_MONGODB_URI) {
  console.error('❌ MONGODB_URI and RECIPE_MONGODB_URI must both be set in savorsync-api/.env');
  process.exit(1);
}

const { userDb, recipeDb } = require('../config/mongoose');
const Recipe = require('../models/Recipe');
const { globalRecipes } = require('./data/global-recipes');
const { regionalAmericanRecipes } = require('./generate-american-regional-recipes');

// The American recipes were written with a placeholder video link; don't seed it
const PLACEHOLDER_VIDEO = 'dQw4w9WgXcQ';
const DRY_RUN = process.argv.includes('--dry-run');

const prepare = (recipe) => {
  const doc = { ...recipe };
  for (const key of ['shortform_video_url', 'longform_video_url']) {
    if (doc[key] && doc[key].includes(PLACEHOLDER_VIDEO)) delete doc[key];
  }
  return doc;
};

const main = async () => {
  await recipeDb.asPromise();
  console.log(`✅ Connected to recipe database "${recipeDb.name}" on ${recipeDb.host}`);

  const recipes = [...globalRecipes, ...regionalAmericanRecipes].map(prepare);

  // Check every recipe against the schema before writing anything
  for (const recipe of recipes) {
    const error = new Recipe(recipe).validateSync();
    if (error) throw new Error(`"${recipe.recipe_name}" is invalid: ${error.message}`);
  }

  // Write through the raw collection so fields outside the schema (culturalBackground, subtitle) are kept
  const collection = recipeDb.db.collection('recipes');

  if (DRY_RUN) {
    const existing = await collection.distinct('recipe_name', { recipe_name: { $in: recipes.map(r => r.recipe_name) } });
    const total = await collection.countDocuments();
    console.log(`\n🔎 Dry run, nothing was written.`);
    console.log(`   The "recipes" collection has ${total} documents.`);
    console.log(`   A real run would add ${recipes.length - existing.length} of ${recipes.length} starter recipes and leave ${existing.length} that already exist untouched.`);
    return;
  }

  const now = new Date();
  let added = 0;
  for (const recipe of recipes) {
    const result = await collection.updateOne(
      { recipe_name: recipe.recipe_name },
      { $setOnInsert: { ...recipe, createdAt: now, updatedAt: now } },
      { upsert: true }
    );
    if (result.upsertedCount) {
      added += 1;
      console.log(`   + ${recipe.recipe_name} (${recipe.cuisine})`);
    }
  }

  const total = await collection.countDocuments();
  console.log(`\n🎉 Added ${added} new recipes. The recipe database now has ${total} recipes.`);
};

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.all([recipeDb.close(), userDb.close()]);
  });
