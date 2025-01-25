require('dotenv').config();
const SpotifyService = require('./services/spotify');
const RecommendationService = require('./services/recommendation');

async function testPlaylistCreation() {
  const recommender = new RecommendationService();
  const tracks = await recommender.generatePlaylist("upbeat rock music");
  const spotify = new SpotifyService();
  const playlist = await spotify.createPlaylist(tracks);
  console.log('Created playlist:', playlist);
}

testPlaylistCreation();