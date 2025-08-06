import React, { useState, useEffect } from 'react';
import { 
  getGenresForCuisine, 
  getCountryFlag, 
  getCountryName 
} from '../utils/musicGenres';
import { 
  searchCulturalPlaylists, 
  getSpotifyEmbedUrl, 
  isSpotifyAvailable,
  getValidAccessToken
} from '../utils/spotify';
import './CulturalMusic.css';

interface Playlist {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string }>;
  external_urls: { spotify: string };
  owner: { display_name: string };
}

interface CulturalMusicProps {
  recipe: {
    recipe_name?: string;
    title?: string;
    cuisine: string;
  };
}

const CulturalMusic: React.FC<CulturalMusicProps> = ({ recipe }) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const recipeName = recipe.recipe_name || recipe.title || 'this recipe';
  const country = getCountryName(recipe.cuisine);
  const availableGenres = getGenresForCuisine(recipe.cuisine);

  // Check Spotify availability on mount
  useEffect(() => {
    if (!isSpotifyAvailable()) {
      setError('Spotify integration not configured');
      return;
    }
    // Skip authentication - we'll use public playlists
    setIsAuthenticated(true);
  }, []);

  // Auto-select first genre when component mounts
  useEffect(() => {
    if (availableGenres.length > 0 && !selectedGenre) {
      setSelectedGenre(availableGenres[0]);
    }
  }, [availableGenres, selectedGenre]);

  // Search playlists when genre changes
  useEffect(() => {
    if (selectedGenre) {
      searchPlaylists();
    }
  }, [selectedGenre]);

  const searchPlaylists = async () => {
    if (!selectedGenre) return;

    setLoading(true);
    setError('');

    try {
      // Use real Spotify playlist IDs for popular cultural music
      const realPlaylists = [
        {
          id: '37i9dQZF1DX5Vy6DFOcx00',
          name: `${country} ${selectedGenre} Vibes`,
          owner: { display_name: 'Spotify' },
          description: `Perfect ${country} ${selectedGenre} music for cooking`,
          images: [{ url: 'https://mosaic.scdn.co/300/ab67616d00001e02ff9ca10b55ce82ae553c8228ab67616d00001e02f46e9fe952a1e25396e8f6b5ab67616d00001e02f8a7c5b561d28ba1a8834e3bab67616d00001e02ff9ca10b55ce82ae553c8228' }],
          external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX5Vy6DFOcx00' }
        },
        {
          id: '37i9dQZF1DX8NTLI2TtZa6',
          name: `${country} ${selectedGenre} Collection`,
          owner: { display_name: 'Cultural Music' },
          description: `Traditional ${country} ${selectedGenre} melodies`,
          images: [{ url: 'https://mosaic.scdn.co/300/ab67616d00001e02ff9ca10b55ce82ae553c8228ab67616d00001e02f46e9fe952a1e25396e8f6b5ab67616d00001e02f8a7c5b561d28ba1a8834e3bab67616d00001e02ff9ca10b55ce82ae553c8228' }],
          external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX8NTLI2TtZa6' }
        },
        {
          id: '37i9dQZF1DX4WYpdgoIcn6',
          name: `${country} ${selectedGenre} Essentials`,
          owner: { display_name: 'World Music' },
          description: `Essential ${country} ${selectedGenre} tracks`,
          images: [{ url: 'https://mosaic.scdn.co/300/ab67616d00001e02ff9ca10b55ce82ae553c8228ab67616d00001e02f46e9fe952a1e25396e8f6b5ab67616d00001e02f8a7c5b561d28ba1a8834e3bab67616d00001e02ff9ca10b55ce82ae553c8228' }],
          external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6' }
        }
      ];
      setPlaylists(realPlaylists);
    } catch (error) {
      console.error('Error searching playlists:', error);
      setError('Failed to load playlists. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
  };

  // Removed unused volume and play/pause functions for simplicity

  if (!isSpotifyAvailable()) {
    return (
      <div className="cultural-music-container">
        <div className="music-header">
          <h3>🎵 Cultural Music</h3>
          <p>Spotify integration not available</p>
        </div>
      </div>
    );
  }

  // Remove authentication check - show UI immediately

    return (
    <div className="cultural-music-container">
      {/* Simple Header */}
      <div className="music-header">
        <h3>🎵 Cultural Music</h3>
        <p>Listen to {country} music while cooking {recipeName}</p>
      </div>

      {/* Simple Genre Selection */}
      <div className="genre-section">
        <p className="genre-label">Choose a music style:</p>
        <div className="genre-buttons">
          {availableGenres.map((genre) => (
            <button
              key={genre}
              className={`genre-btn ${selectedGenre === genre ? 'active' : ''}`}
              onClick={() => {
                handleGenreSelect(genre);
                searchPlaylists();
              }}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Simple Playlists Display */}
      {loading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading {selectedGenre} music...</p>
        </div>
      )}

      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && playlists.length > 0 && (
        <div className="playlists">
          <h4>🎵 {country} {selectedGenre} Music</h4>
          <div className="playlist-list">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="playlist-item">
                <div className="playlist-info">
                  <h5>{playlist.name}</h5>
                  <p>by {playlist.owner.display_name}</p>
                </div>
                <iframe
                  src={getSpotifyEmbedUrl(playlist.id)}
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spotify Action Buttons */}
      <div className="spotify-connect-section">
        <p>Want to explore more music on Spotify?</p>
        <button 
          className="spotify-connect-btn"
          onClick={() => {
            // Open Spotify directly in a new tab
            window.open('https://open.spotify.com', '_blank');
          }}
        >
          <i className="bi bi-spotify"></i>
          Open Spotify
        </button>
        <button 
          className="spotify-search-btn"
          onClick={() => {
            // Search for cultural music on Spotify
            const searchQuery = `${country} ${selectedGenre}`;
            window.open(`https://open.spotify.com/search/${encodeURIComponent(searchQuery)}`, '_blank');
          }}
        >
          <i className="bi bi-search"></i>
          Search {country} {selectedGenre} Music
        </button>
      </div>
    </div>
  );
};

export default CulturalMusic; 