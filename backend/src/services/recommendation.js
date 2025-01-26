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
        const keywords = await this.gemini.getKeywords(userInput);
        const searchQuery = this.buildSearchQuery(keywords);
        const tracks = await this.spotify.searchTracks(searchQuery);
        const playlist = await this.spotify.createPlaylist(tracks);

        return { playlist, keywords };
      }
  
    buildSearchQuery(keywords) {
      // Search by artist only initially
      return `artist:${keywords.similar_artists[0]}`;
    }
  }
  
  module.exports = RecommendationService;