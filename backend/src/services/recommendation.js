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
      const artistNames = keywords.similar_artists.slice(0, 20);

      // Fetch up to 10 tracks per artist and interleave for variety
      const perArtistTracks = await Promise.all(
        artistNames.map(name => this.spotify.searchTracksByArtist(name, 10))
      );

      // Interleave tracks to avoid clustering by artist
      const interleaved = [];
      const maxLen = Math.max(...perArtistTracks.map(list => list.length));
      for (let i = 0; i < maxLen; i++) {
        for (const list of perArtistTracks) {
          if (list[i]) interleaved.push(list[i]);
        }
      }

      // Limit per-artist to 5 to keep balance, then cap total to 100
      const seenPerArtist = new Map();
      const balanced = [];
      for (const track of interleaved) {
        const artistId = track.artists[0]?.id ?? track.artists[0];
        const count = seenPerArtist.get(artistId) || 0;
        if (count < 5) {
          seenPerArtist.set(artistId, count + 1);
          balanced.push(track);
        }
        if (balanced.length >= 100) break;
      }

      const playlist = await this.spotify.createPlaylist(balanced);
    return { playlist, keywords };
  } catch (error) {
    console.error('Recommendation error:', error);
    throw error;
  }
}
}

module.exports = RecommendationService;