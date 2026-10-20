import React, { useState, useEffect, useCallback } from 'react';
import { getGenresForCuisine, getCountryName } from '../utils/musicGenres';
import { getCulturalPlaylists, MusicPlaylist } from '../services/apiMusic';
import './CulturalMusic.css';

interface CulturalMusicProps {
  recipe: {
    recipe_name?: string;
    title?: string;
    cuisine: string;
  };
}

type LoadState = 'loading' | 'error' | 'ready';

// "Cook with music" (README): real Spotify playlists for the dish's country and
// a music style, found by our API so visitors never need a Spotify login.
const CulturalMusic: React.FC<CulturalMusicProps> = ({ recipe }) => {
  const country = getCountryName(recipe.cuisine);
  const genres = getGenresForCuisine(recipe.cuisine);
  const recipeName = recipe.recipe_name || recipe.title || 'this dish';

  const [genre, setGenre] = useState(genres[0]);
  const [state, setState] = useState<LoadState>('loading');
  const [playlists, setPlaylists] = useState<MusicPlaylist[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchUrl, setSearchUrl] = useState(
    `https://open.spotify.com/search/${encodeURIComponent(`${country} ${genres[0]}`)}/playlists`
  );
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async (style: string) => {
    setState('loading');
    setSearchUrl(`https://open.spotify.com/search/${encodeURIComponent(`${country} ${style}`)}/playlists`);
    try {
      const result = await getCulturalPlaylists(country, style);
      setPlaylists(result.playlists);
      setSelectedId(result.playlists[0]?.id || null);
      setSearchUrl(result.searchUrl);
      setState('ready');
    } catch (err) {
      const failure = err as Error & { searchUrl?: string };
      setErrorMessage(failure.message);
      if (failure.searchUrl) setSearchUrl(failure.searchUrl);
      setState('error');
    }
  }, [country]);

  useEffect(() => {
    load(genre);
  }, [genre, load]);

  const selected = playlists.find(p => p.id === selectedId) || null;

  return (
    <section className="cultural-music" aria-labelledby="cultural-music-title">
      <div className="cultural-music__header">
        <i className="bi bi-music-note-beamed cultural-music__icon" aria-hidden="true"></i>
        <div>
          <h3 id="cultural-music-title" className="cultural-music__title">Cook with music</h3>
          <p className="cultural-music__subtitle">Music from {country} to play while you cook {recipeName}.</p>
        </div>
      </div>

      <div className="cultural-music__genres" role="group" aria-label="Music style">
        {genres.map(style => (
          <button
            key={style}
            type="button"
            className="cultural-music__chip"
            aria-pressed={style === genre}
            onClick={() => setGenre(style)}
          >
            {style === genre && <i className="bi bi-check" aria-hidden="true"></i>}
            {style}
          </button>
        ))}
      </div>

      {state === 'loading' && (
        <div className="cultural-music__skeleton" aria-busy="true">
          <span className="cultural-music__sr">Loading playlists</span>
        </div>
      )}

      {state === 'error' && (
        <div className="cultural-music__notice" role="status">
          <i className="bi bi-exclamation-circle cultural-music__notice-icon--error" aria-hidden="true"></i>
          <span>{errorMessage}</span>
          <button type="button" className="cultural-music__ghost" onClick={() => load(genre)}>Try again</button>
        </div>
      )}

      {state === 'ready' && selected && (
        <div className="cultural-music__player">
          <iframe
            key={selected.id}
            title={`Spotify playlist: ${selected.name}`}
            src={`https://open.spotify.com/embed/playlist/${selected.id}?utm_source=generator`}
            width="100%"
            height="352"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>

          {playlists.length > 1 && (
            <ul className="cultural-music__list" aria-label="More playlists">
              {playlists.map(playlist => (
                <li key={playlist.id}>
                  <button
                    type="button"
                    className="cultural-music__item"
                    aria-pressed={playlist.id === selectedId}
                    onClick={() => setSelectedId(playlist.id)}
                  >
                    {playlist.image ? (
                      <img src={playlist.image} alt="" className="cultural-music__cover" loading="lazy" />
                    ) : (
                      <span className="cultural-music__cover cultural-music__cover--empty" aria-hidden="true">
                        <i className="bi bi-music-note"></i>
                      </span>
                    )}
                    <span className="cultural-music__meta">
                      <span className="cultural-music__name">{playlist.name}</span>
                      <span className="cultural-music__owner">by {playlist.owner}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {state === 'ready' && !selected && (
        <div className="cultural-music__notice" role="status">
          <i className="bi bi-spotify cultural-music__notice-icon" aria-hidden="true"></i>
          <span>Find {country} {genre.toLowerCase()} playlists on Spotify.</span>
        </div>
      )}

      <a className="cultural-music__open" href={searchUrl} target="_blank" rel="noopener noreferrer">
        <i className="bi bi-spotify" aria-hidden="true"></i>
        Search {country} {genre} on Spotify
      </a>
    </section>
  );
};

export default CulturalMusic;
