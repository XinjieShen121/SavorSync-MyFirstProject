import axios from 'axios';
import { API_BASE_URL } from './config';

export interface MusicPlaylist {
  id: string;
  name: string;
  owner: string;
  image: string | null;
  url: string;
}

export interface MusicPlaylistsResponse {
  configured: boolean;
  playlists: MusicPlaylist[];
  searchUrl: string;
}

const musicAPI = axios.create({
  baseURL: `${API_BASE_URL}/music`,
  timeout: 15000,
});

/**
 * Spotify playlists for a country and music style, found by the API (no Spotify login needed)
 */
export const getCulturalPlaylists = async (country: string, genre: string): Promise<MusicPlaylistsResponse> => {
  try {
    const response = await musicAPI.get('/playlists', { params: { country, genre } });
    return response.data;
  } catch (error) {
    const data = axios.isAxiosError(error) ? error.response?.data : undefined;
    const err = new Error(data?.message || "We couldn't load playlists right now. Try again in a moment.") as Error & { searchUrl?: string };
    err.searchUrl = data?.searchUrl;
    throw err;
  }
};
