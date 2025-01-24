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

 async createPlaylist(userId, tracks, name) {
   await this.initializeToken();
   const playlist = await this.api.createPlaylist(userId, name, { public: true });
   await this.api.addTracksToPlaylist(playlist.body.id, tracks);
   return playlist.body.external_urls.spotify;
 }
}

module.exports = SpotifyService;