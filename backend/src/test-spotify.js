require('dotenv').config();
const SpotifyService = require('./services/spotify');

async function testSpotify() {
  const spotify = new SpotifyService();
  try {
    const tracks = await spotify.searchTracks('The Beatles');
    console.log('Search results:', tracks.slice(0, 2));
  }
  catch (error) {
    console.error('Error:', error.message);
  }
}

testSpotify();