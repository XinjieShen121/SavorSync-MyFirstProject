const mongoose = require("mongoose");

const userDb = mongoose.createConnection(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const recipeDb = mongoose.createConnection(process.env.RECIPE_MONGODB_URI.replace('/?', '/savorsync_db?'), {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Handle connection events for user database
userDb.on('connected', () => {
  console.log('✅ User MongoDB Connected:', userDb.host);
  console.log('📊 User Database:', userDb.name);
});

userDb.on('error', (err) => {
  console.error('❌ User MongoDB Connection Error:', err.message);
});

// Handle connection events for recipe database
recipeDb.on('connected', () => {
  console.log('✅ Recipe MongoDB Connected:', recipeDb.host);
  console.log('📊 Recipe Database:', recipeDb.name);
});

recipeDb.on('error', (err) => {
  console.error('❌ Recipe MongoDB Connection Error:', err.message);
});

module.exports = { userDb, recipeDb }; 