// Cultural Music Genres Mapping
export const culturalGenreMap: Record<string, string[]> = {
  // Asian Cuisines
  'Japan': ['Traditional', 'Pop', 'Ambient', 'Lo-Fi', 'J-Pop'],
  'China': ['Traditional', 'Lo-Fi', 'Classical', 'Pop', 'Folk'],
  'Korea': ['K-Pop', 'Traditional', 'Lo-Fi', 'Pop', 'Indie'],
  'Thailand': ['Traditional', 'Pop', 'Folk', 'Luk Thung', 'Mor Lam'],
  'Vietnam': ['Traditional', 'Pop', 'Folk', 'V-Pop', 'Cai Luong'],
  'India': ['Bollywood', 'Classical', 'Folk', 'Pop', 'Bhajan'],
  
  // European Cuisines
  'Italy': ['Classical', 'Opera', 'Folk', 'Pop', 'Jazz'],
  'France': ['Chanson', 'Jazz', 'Accordion', 'Classical', 'Pop'],
  'Spain': ['Flamenco', 'Pop', 'Folk', 'Classical', 'Jazz'],
  'Greece': ['Traditional', 'Folk', 'Pop', 'Classical', 'Rebetiko'],
  'Germany': ['Classical', 'Folk', 'Pop', 'Jazz', 'Schlager'],
  'Netherlands': ['Pop', 'Folk', 'Classical', 'Jazz', 'Electronic'],
  
  // American Cuisines
  'Mexico': ['Mariachi', 'Latin Jazz', 'Cumbia', 'Pop', 'Folk'],
  'Brazil': ['Bossa Nova', 'Samba', 'MPB', 'Jazz', 'Pop'],
  'Argentina': ['Tango', 'Folk', 'Pop', 'Jazz', 'Classical'],
  'Peru': ['Traditional', 'Folk', 'Pop', 'Cumbia', 'Jazz'],
  'Colombia': ['Cumbia', 'Vallenato', 'Pop', 'Folk', 'Jazz'],
  
  // Middle Eastern Cuisines
  'Lebanon': ['Traditional', 'Pop', 'Folk', 'Classical', 'Jazz'],
  'Turkey': ['Traditional', 'Pop', 'Folk', 'Classical', 'Jazz'],
  'Morocco': ['Traditional', 'Pop', 'Folk', 'Classical', 'Jazz'],
  'Iran': ['Traditional', 'Pop', 'Folk', 'Classical', 'Jazz'],
  'Egypt': ['Traditional', 'Pop', 'Folk', 'Classical', 'Jazz'],
  
  // African Cuisines
  'Ethiopia': ['Traditional', 'Folk', 'Pop', 'Jazz', 'Classical'],
  'Nigeria': ['Afrobeats', 'Pop', 'Folk', 'Jazz', 'Classical'],
  'South Africa': ['Traditional', 'Pop', 'Jazz', 'Folk', 'Classical'],
  'Senegal': ['Mbalax', 'Pop', 'Folk', 'Jazz', 'Classical'],
  'Ghana': ['Highlife', 'Pop', 'Folk', 'Jazz', 'Classical'],
  
  // Default fallback
  'default': ['Pop', 'Classical', 'Jazz', 'Folk', 'Ambient']
};

// Country to cuisine mapping for better genre selection
export const cuisineToCountryMap: Record<string, string> = {
  'Japanese': 'Japan',
  'Chinese': 'China',
  'Korean': 'Korea',
  'Thai': 'Thailand',
  'Vietnamese': 'Vietnam',
  'Indian': 'India',
  'Italian': 'Italy',
  'French': 'France',
  'Spanish': 'Spain',
  'Greek': 'Greece',
  'German': 'Germany',
  'Dutch': 'Netherlands',
  'Mexican': 'Mexico',
  'Brazilian': 'Brazil',
  'Argentine': 'Argentina',
  'Peruvian': 'Peru',
  'Colombian': 'Colombia',
  'Lebanese': 'Lebanon',
  'Turkish': 'Turkey',
  'Moroccan': 'Morocco',
  'Iranian': 'Iran',
  'Egyptian': 'Egypt',
  'Ethiopian': 'Ethiopia',
  'Nigerian': 'Nigeria',
  'South African': 'South Africa',
  'Senegalese': 'Senegal',
  'Ghanaian': 'Ghana'
};

// Country flag emojis
export const countryFlags: Record<string, string> = {
  'Japan': '🇯🇵',
  'China': '🇨🇳',
  'Korea': '🇰🇷',
  'Thailand': '🇹🇭',
  'Vietnam': '🇻🇳',
  'India': '🇮🇳',
  'Italy': '🇮🇹',
  'France': '🇫🇷',
  'Spain': '🇪🇸',
  'Greece': '🇬🇷',
  'Germany': '🇩🇪',
  'Netherlands': '🇳🇱',
  'Mexico': '🇲🇽',
  'Brazil': '🇧🇷',
  'Argentina': '🇦🇷',
  'Peru': '🇵🇪',
  'Colombia': '🇨🇴',
  'Lebanon': '🇱🇧',
  'Turkey': '🇹🇷',
  'Morocco': '🇲🇦',
  'Iran': '🇮🇷',
  'Egypt': '🇪🇬',
  'Ethiopia': '🇪🇹',
  'Nigeria': '🇳🇬',
  'South Africa': '🇿🇦',
  'Senegal': '🇸🇳',
  'Ghana': '🇬🇭'
};

// Helper function to get genres for a cuisine
export function getGenresForCuisine(cuisine: string): string[] {
  const country = cuisineToCountryMap[cuisine] || cuisine;
  return culturalGenreMap[country] || culturalGenreMap['default'];
}

// Helper function to get country flag
export function getCountryFlag(cuisine: string): string {
  const country = cuisineToCountryMap[cuisine] || cuisine;
  return countryFlags[country] || '🌍';
}

// Helper function to get country name
export function getCountryName(cuisine: string): string {
  return cuisineToCountryMap[cuisine] || cuisine;
} 