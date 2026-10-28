const express = require('express');
const router = express.Router();

// Spotify playlist search for "Cook with music".
// Uses the Client Credentials flow, so visitors never have to log in to Spotify.
// Needs SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in the API's environment.

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SEARCH_URL = 'https://api.spotify.com/v1/search';
const RESULTS_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_TERM_LENGTH = 60;

let cachedToken = null;
const resultsCache = new Map();

const isConfigured = () => !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);

const getAccessToken = async () => {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60 * 1000) {
    return cachedToken.value;
  }

  const credentials = Buffer
    .from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`)
    .toString('base64');

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error(`Spotify token request failed with ${response.status}`);
  }

  const data = await response.json();
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.value;
};

const cleanTerm = (value) =>
  typeof value === 'string' ? value.replace(/[^\p{L}\p{N}\s'-]/gu, '').trim().slice(0, MAX_TERM_LENGTH) : '';

/**
 * @route GET /api/music/playlists?country=Japan&genre=Traditional
 * @desc Up to 4 Spotify playlists for a country and music style
 * @access Public
 */
router.get('/playlists', async (req, res) => {
  const country = cleanTerm(req.query.country);
  const genre = cleanTerm(req.query.genre);
  const query = [country, genre].filter(Boolean).join(' ');
  const searchUrl = `https://open.spotify.com/search/${encodeURIComponent(query || 'world music')}/playlists`;

  if (!query) {
    return res.status(400).json({ error: 'Missing search', message: 'Choose a cuisine and a music style.' });
  }

  if (!isConfigured()) {
    return res.json({ configured: false, playlists: [], searchUrl });
  }

  const cacheKey = query.toLowerCase();
  const cached = resultsCache.get(cacheKey);
  if (cached && Date.now() - cached.at < RESULTS_TTL_MS) {
    return res.json({ configured: true, playlists: cached.playlists, searchUrl });
  }

  try {
    const token = await getAccessToken();
    const params = new URLSearchParams({ q: `${query} music`, type: 'playlist', limit: '8' });
    const response = await fetch(`${SEARCH_URL}?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Spotify search failed with ${response.status}`);
    }

    const data = await response.json();
    // Spotify can return null entries in playlist search results
    const playlists = (data.playlists?.items || [])
      .filter(item => item && item.id)
      .slice(0, 4)
      .map(item => ({
        id: item.id,
        name: item.name,
        owner: item.owner?.display_name || 'Spotify',
        image: item.images?.[0]?.url || null,
        url: item.external_urls?.spotify || `https://open.spotify.com/playlist/${item.id}`
      }));

    resultsCache.set(cacheKey, { playlists, at: Date.now() });
    res.json({ configured: true, playlists, searchUrl });
  } catch (error) {
    console.error('Spotify playlist search error:', error.message);
    res.status(502).json({
      error: 'Music unavailable',
      message: "We couldn't load playlists right now. Try again in a moment.",
      searchUrl
    });
  }
});

module.exports = router;
