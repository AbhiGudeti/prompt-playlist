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
  const artistQueries = keywords.similar_artists
    .slice(0, 20)  // Increase to 20 artists
    .map(artist => `"${artist}"`)
    .join(' OR ');
  return artistQueries;
}

async generatePlaylist(userInput) {
  try {
    const keywords = await this.gemini.getKeywords(userInput);
    const artistQuery = this.buildSearchQuery(keywords);
    let tracks = await this.spotify.searchTracks(artistQuery);
    
    // Group by artist and limit each to 5 songs
    const tracksByArtist = tracks.reduce((acc, track) => {
      const artistId = track.artists[0].id;
      if (!acc[artistId]) acc[artistId] = [];
      if (acc[artistId].length < 5) acc[artistId].push(track);
      return acc;
    }, {});

    // Flatten and shuffle
    const limitedTracks = Object.values(tracksByArtist)
      .flat()
      .sort(() => Math.random() - 0.5)
      .slice(0, 100);

    const playlist = await this.spotify.createPlaylist(limitedTracks);
    return { playlist, keywords };
  } catch (error) {
    console.error('Recommendation error:', error);
    throw error;
  }
}
}

module.exports = RecommendationService;