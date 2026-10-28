// Check the API's settings before anything connects, so a missing value is
// reported by name instead of crashing later with an unrelated error.
// Every setting is described in savorsync-api/.env.example.

const REQUIRED = {
  MONGODB_URI: 'connection string for the users database',
  RECIPE_MONGODB_URI: 'connection string for the recipes database (can be the same as MONGODB_URI)',
};

const OPTIONAL = {
  OPENAI_API_KEY: 'AI swaps, "Ask about this dish" and Cook with AI use simpler fallbacks or are switched off',
  SPOTIFY_CLIENT_ID: 'music shows an "Open in Spotify" link instead of playlists',
  CLOUDINARY_CLOUD_NAME: 'photo uploads fail',
};

const checkEnv = () => {
  const missing = Object.keys(REQUIRED).filter(name => !process.env[name]);
  if (missing.length) {
    const lines = missing.map(name => `  - ${name}: ${REQUIRED[name]}`).join('\n');
    throw new Error(`Missing required settings:\n${lines}\nSet them in savorsync-api/.env locally, or under Environment on Render.`);
  }
  for (const [name, effect] of Object.entries(OPTIONAL)) {
    if (!process.env[name]) console.warn(`⚠️ ${name} is not set: ${effect}`);
  }
};

module.exports = { checkEnv };
