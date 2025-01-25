const SpotifyWebApi = require('spotify-web-api-node');

class SpotifyService {
 constructor() {
   this.api = new SpotifyWebApi({
     clientId: process.env.SPOTIFY_CLIENT_ID,
     clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
     redirectUri: 'http://localhost:8888/callback'
   });
 }

 async initializeToken() {
   try {
     const data = await this.api.clientCredentialsGrant();
     this.api.setAccessToken(data.body['access_token']);
   } catch (error) {
     console.error('Spotify Auth Error:', error);
     throw error;
   }
 }

 async searchTracks(query) {
   await this.initializeToken();
   const response = await this.api.searchTracks(query);
   return response.body.tracks.items;
 }

 async createPlaylist(tracks) {
   await this.initializeToken();

   const playlist = await this.api.createPlaylist('Your Curated Playlist!', {
    description: 'Generated playlist based on your preferences!',
    public: true
   });

   const trackUris = tracks.map(track => track.uri);
   await this.api.addTracksToPlaylist(playlist.body.id, trackUris);

   return {
    playlistId: playlist.body.id,
    url: playlist.body.external_urls.spotify
   };
 }

 authorize() {  // Remove async
  const scopes = ['playlist-modify-public', 'user-read-private'];
  return this.api.createAuthorizeURL(scopes, 'state');
}
}

module.exports = SpotifyService;