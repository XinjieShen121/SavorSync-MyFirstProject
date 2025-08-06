// Spotify Web API utilities
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:5173/callback';

// Spotify API endpoints
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';

// Get Spotify authorization URL
export function getSpotifyAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'token',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: 'playlist-read-private playlist-read-collaborative',
    show_dialog: 'false'
  });
  
  return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

// Extract access token from URL hash
export function getAccessTokenFromURL(): string | null {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get('access_token');
}

// Get stored access token
export function getStoredAccessToken(): string | null {
  return localStorage.getItem('spotify_access_token');
}

// Store access token
export function storeAccessToken(token: string): void {
  localStorage.setItem('spotify_access_token', token);
}

// Remove stored access token
export function removeStoredAccessToken(): void {
  localStorage.removeItem('spotify_access_token');
}

// Check if token is expired (Spotify tokens expire in 1 hour)
export function isTokenExpired(tokenTimestamp: number): boolean {
  const now = Date.now();
  const tokenAge = now - tokenTimestamp;
  const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
  return tokenAge > oneHour;
}

// Get valid access token (check stored or redirect to auth)
export async function getValidAccessToken(): Promise<string | null> {
  const storedToken = getStoredAccessToken();
  const tokenTimestamp = localStorage.getItem('spotify_token_timestamp');
  
  if (storedToken && tokenTimestamp) {
    if (!isTokenExpired(parseInt(tokenTimestamp))) {
      return storedToken;
    } else {
      // Token expired, remove it
      removeStoredAccessToken();
      localStorage.removeItem('spotify_token_timestamp');
    }
  }
  
  // No valid token, redirect to auth
  window.location.href = getSpotifyAuthUrl();
  return null;
}

// Search Spotify playlists
export async function searchSpotifyPlaylists(query: string, limit: number = 5): Promise<any[]> {
  try {
    const token = getStoredAccessToken();
    
    if (!token) {
      console.warn('No Spotify access token available');
      return [];
    }
    
    const response = await fetch(
      `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=playlist&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.playlists?.items || [];
  } catch (error) {
    console.error('Error searching Spotify playlists:', error);
    return [];
  }
}

// Get playlist details
export async function getPlaylistDetails(playlistId: string): Promise<any | null> {
  try {
    const token = getStoredAccessToken();
    
    if (!token) {
      console.warn('No Spotify access token available');
      return null;
    }
    
    const response = await fetch(
      `${SPOTIFY_API_BASE}/playlists/${playlistId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting playlist details:', error);
    return null;
  }
}

// Search for cultural music playlists
export async function searchCulturalPlaylists(country: string, genre: string): Promise<any[]> {
  const searchQueries = [
    `${country} ${genre}`,
    `${genre} ${country}`,
    `${country} ${genre} music`,
    `${country} ${genre} playlist`
  ];
  
  const allPlaylists: any[] = [];
  
  for (const query of searchQueries) {
    const playlists = await searchSpotifyPlaylists(query, 3);
    allPlaylists.push(...playlists);
  }
  
  // Remove duplicates and limit to 5
  const uniquePlaylists = allPlaylists.filter((playlist, index, self) => 
    index === self.findIndex(p => p.id === playlist.id)
  );
  
  return uniquePlaylists.slice(0, 5);
}

// Handle Spotify callback
export function handleSpotifyCallback(): void {
  const token = getAccessTokenFromURL();
  
  if (token) {
    storeAccessToken(token);
    localStorage.setItem('spotify_token_timestamp', Date.now().toString());
    
    // Remove hash from URL
    window.history.replaceState({}, document.title, window.location.pathname);
    
    console.log('Spotify access token stored successfully');
  }
}

// Check if Spotify is available
export function isSpotifyAvailable(): boolean {
  return !!SPOTIFY_CLIENT_ID;
}

// Get Spotify embed URL for a playlist
export function getSpotifyEmbedUrl(playlistId: string): string {
  return `https://open.spotify.com/embed/playlist/${playlistId}`;
} 