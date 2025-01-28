const SpotifyService = require('./spotify');
const GeminiService = require('./gemini');

class RecommendationService {
 constructor() {
   if (!process.env.GEMINI_API_KEY) {
     throw new Error('Missing Gemini API key');
   }
   this.spotify = new SpotifyService();
   this.gemini = new GeminiService();
 }

 buildSearchQuery(keywords) {
  // Quote each artist name and combine with OR
  const artistQuery = keywords.similar_artists
    .map(artist => `"${artist}"`)
    .join(' OR ');
  
  return artistQuery;
}

 async generatePlaylist(userInput) {
   try {
     const keywords = await this.gemini.getKeywords(userInput);
     console.log('Keywords received:', keywords);

     let tracks = [];

     // Try artist search first
     const artistQuery = this.buildSearchQuery(keywords);
     tracks = await this.spotify.searchTracks(artistQuery);

     // If no results, try genre search
     if (tracks.length === 0) {
       const genreQuery = keywords.genres[0];
       tracks = await this.spotify.searchTracks(genreQuery);
     }

     if (tracks.length === 0) {
       throw new Error('No tracks found matching the criteria');
     }

     // Shuffle and limit tracks
     const shuffledTracks = tracks.sort(() => Math.random() - 0.5).slice(0, 20);
     const playlist = await this.spotify.createPlaylist(shuffledTracks);

     return { playlist, keywords };
   } catch (error) {
     console.error('Recommendation error:', error);
     throw error;
   }
 }
}

module.exports = RecommendationService;