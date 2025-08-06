# Spotify Integration Setup Guide

## Overview
The Cultural Music component integrates with Spotify Web API to provide authentic cultural music playlists while cooking recipes.

## Setup Instructions

### 1. Create a Spotify App
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in the app details:
   - **App name**: SavorSync Cultural Music
   - **App description**: Cultural music integration for cooking app
   - **Website**: Your app's URL (e.g., `http://localhost:5173`)
       - **Redirect URI**: `http://127.0.0.1:5173/callback` (for development)
   - **Category**: Other

### 2. Get Your Client ID
1. After creating the app, you'll see your **Client ID**
2. Copy this Client ID for the next step

### 3. Configure Environment Variables
Create a `.env` file in the `savorsync-frontend` directory with:

```env
# Spotify Web API Configuration
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
    VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback
```

Replace `your_spotify_client_id_here` with your actual Client ID from step 2.

### 4. Update Redirect URIs (for Production)
When deploying to production, update the redirect URI in your Spotify app settings:
    - **Production URL**: `https://tastelegacies.netlify.app/callback`
- Update the `VITE_SPOTIFY_REDIRECT_URI` in your production environment

## How It Works

### Authentication Flow
1. User clicks "Connect to Spotify" in the Cultural Music component
2. User is redirected to Spotify for authorization
3. After authorization, user is redirected back to `/callback`
4. Access token is stored in localStorage
5. User can now search and play cultural music playlists

### Features
- **Auto-detection**: Automatically detects recipe cuisine and suggests relevant genres
- **Cultural Mapping**: Maps cuisines to countries and cultural music genres
- **Playlist Search**: Searches Spotify for cultural playlists based on country and genre
- **Embedded Player**: Uses Spotify's embedded player for seamless playback
- **No Login Required**: Users can preview music without creating Spotify accounts

### Supported Cuisines
The component supports cultural music for:
- **Asian**: Japanese, Chinese, Korean, Thai, Vietnamese, Indian
- **European**: Italian, French, Spanish, Greek, German, Dutch
- **American**: Mexican, Brazilian, Argentine, Peruvian, Colombian
- **Middle Eastern**: Lebanese, Turkish, Moroccan, Iranian, Egyptian
- **African**: Ethiopian, Nigerian, South African, Senegalese, Ghanaian

### Genre Categories
Each cuisine has culturally relevant genres:
- **Traditional**: Folk and classical music
- **Pop**: Modern popular music
- **Jazz**: Jazz and fusion styles
- **Classical**: Orchestral and classical compositions
- **Folk**: Traditional folk music
- **Specialized**: Cuisine-specific genres (e.g., Mariachi for Mexico, K-Pop for Korea)

## Troubleshooting

### Common Issues

1. **"Spotify integration not configured"**
   - Check that `VITE_SPOTIFY_CLIENT_ID` is set in your `.env` file
   - Restart your development server after adding environment variables

2. **"Authentication failed"**
   - Verify your redirect URI matches exactly in Spotify Dashboard
   - Check that your Client ID is correct
   - Ensure your app is not in "Development Mode" if testing with other users

3. **"No playlists found"**
   - This is normal for some cuisine/genre combinations
   - The component will show a helpful message
   - Try different genres for the same cuisine

4. **CORS Issues**
   - Spotify Web API doesn't require CORS configuration
   - If you see CORS errors, check your network requests

### Development Notes
- Access tokens expire after 1 hour
- The app automatically handles token refresh
- Users will be redirected to Spotify auth when tokens expire
- All playlist data comes from Spotify's public API

## Security Considerations
- Client ID is safe to expose in frontend code
- Access tokens are stored in localStorage (temporary, 1-hour expiry)
- No user credentials are stored
- All API calls use Spotify's official endpoints

## API Limits
- Spotify Web API has rate limits
- The component searches up to 5 playlists per genre
- Searches are cached to minimize API calls
- Users can manually refresh to get new results 