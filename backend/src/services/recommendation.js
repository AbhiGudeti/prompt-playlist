const SpotifyService = require('./spotify');
const GeminiService = require('./gemini');

class RecommendationService {
    constructor() {
        this.spotify = new SpotifyService();
        this.gemini = new GeminiService();
    }

    async generatePlaylist(input) {
        const keywords = await this.gemini.getKeywords(input);
        const searchquery = this.buildSearchQuery(keywords);
        const tracks = await this.spotify.searchTracks(searchquery);

        return tracks.slice(0, 50); //limit to 50 for now...
    }

    buildSearchQuery(keywords) {
        return `genre:${keywords.genres[0]} artist:${keywords.similar_artists[0]}`;
    }
}

module.exports = RecommendationService;