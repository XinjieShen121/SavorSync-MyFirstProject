const { ObjectId } = require('mongodb');
const { recipeDb } = require('./mongoose');
const User = require('../models/User');

// Trending: recipes people are saving and cooking right now.
// Score = 3 per favorite + 2 per review in the last 30 days + 1 per 4-5 star review.
const WINDOW_DAYS = 30;
const CACHE_TTL_MS = 10 * 60 * 1000;
let cache = null;

const scoreRecipes = (favoriteCounts, reviewStats) => {
  const scores = new Map();
  const bump = (id, field, value) => {
    const entry = scores.get(id) || { favorites: 0, recentReviews: 0, goodReviews: 0, score: 0 };
    entry[field] += value;
    scores.set(id, entry);
  };
  favoriteCounts.forEach(({ _id, count }) => bump(String(_id), 'favorites', count));
  reviewStats.forEach(({ _id, recent, good }) => {
    bump(String(_id), 'recentReviews', recent);
    bump(String(_id), 'goodReviews', good);
  });
  scores.forEach(entry => {
    entry.score = entry.favorites * 3 + entry.recentReviews * 2 + entry.goodReviews;
  });
  return [...scores.entries()]
    .filter(([id, entry]) => ObjectId.isValid(id) && entry.score > 0)
    .sort((a, b) => b[1].score - a[1].score);
};

const getTrending = async (limit) => {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS && cache.limit >= limit) {
    return cache.recipes.slice(0, limit);
  }

  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const [favoriteCounts, reviewStats] = await Promise.all([
    User.aggregate([
      { $unwind: '$favorites' },
      { $group: { _id: '$favorites', count: { $sum: 1 } } },
    ]),
    recipeDb.db.collection('reviews').aggregate([
      { $group: {
        _id: '$recipeId',
        recent: { $sum: { $cond: [{ $gte: ['$updatedAt', since] }, 1, 0] } },
        good: { $sum: { $cond: [{ $gte: ['$rating', 4] }, 1, 0] } },
      } },
    ]).toArray(),
  ]);

  const ranked = scoreRecipes(favoriteCounts, reviewStats).slice(0, limit * 2);
  const recipes = recipeDb.db.collection('recipes');
  const publicOnly = { generated: { $ne: true }, draft: { $ne: true } };

  const found = await recipes.find({ ...publicOnly, _id: { $in: ranked.map(([id]) => new ObjectId(id)) } }).toArray();
  const byId = new Map(found.map(recipe => [String(recipe._id), recipe]));
  const result = ranked
    .filter(([id]) => byId.has(id))
    .map(([id, stats]) => ({ ...byId.get(id), trending: stats }))
    .slice(0, limit);

  // Until enough people have saved or reviewed recipes, fill up with dishes
  // that have a photo and a story, so the page is never empty
  if (result.length < limit) {
    const taken = result.map(recipe => recipe._id);
    const fill = await recipes.find({
      ...publicOnly,
      _id: { $nin: taken },
      $or: [{ image_url: { $nin: [null, ''] } }, { image: { $regex: /^https?:/ } }],
    }).limit(limit - result.length).toArray();
    fill.forEach(recipe => result.push({ ...recipe, trending: null }));
  }

  cache = { at: Date.now(), limit, recipes: result };
  return result;
};

module.exports = { getTrending, scoreRecipes };
