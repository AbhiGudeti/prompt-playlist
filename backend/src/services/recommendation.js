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
  
      async generatePlaylist(userInput) {
        try {
          const keywords = await this.gemini.getKeywords(userInput);
          console.log('Keywords received:', keywords);
          const searchQuery = this.buildSearchQuery(keywords);
          console.log('Search query:', searchQuery);
          const tracks = await this.spotify.searchTracks(searchQuery);
          const playlistUrl = await this.spotify.createPlaylist(tracks);
          return playlistUrl;
        } catch (error) {
          console.error('Recommendation error:', error);
          throw error;
        }
      }
  
    buildSearchQuery(keywords) {
      // Search by artist only initially
      return `artist:${keywords.similar_artists[0]}`;
    }
  }
  
  module.exports = RecommendationService;