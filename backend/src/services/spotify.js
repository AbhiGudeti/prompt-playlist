const SpotifyWebApi = require('spotify-web-api-node');
let userAccessToken = null;

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
     console.log('Token response:', data.body);
     this.api.setAccessToken(data.body['access_token']);
   } catch (error) {
     console.error('Token error:', error);
     throw error;
   }
 }

 async searchTracks(query) {
  try {
    await this.initializeToken();
    console.log('Search query sent to Spotify:', query);
    const results = await this.api.searchTracks(query);
    return results.body.tracks.items;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

 async createPlaylist(tracks) {
   if (!tracks || tracks.length === 0) {
     throw new Error('No tracks provided');
   }

   if (!userAccessToken) {
     throw new Error('Please authenticate at /spotify-auth first');
   }

   try {
     this.api.setAccessToken(userAccessToken);
     const me = await this.api.getMe();
     const playlist = await this.api.createPlaylist(me.body.id, {
       name: "Generated Playlist",
       description: 'Created by PromptPlaylist'
     });
     
     const uris = tracks.map(track => track.uri);
     await this.api.addTracksToPlaylist(playlist.body.id, uris);
     return playlist.body.external_urls.spotify;
   } catch (error) {
     console.error('Create playlist error:', error);
     throw error;
   }
 }

 authorize() {
   const scopes = ['playlist-modify-public', 'playlist-modify-private', 'user-read-private'];
   return this.api.createAuthorizeURL(scopes, 'state');
 }

 async handleCallback(code) {
   const data = await this.api.authorizationCodeGrant(code);
   userAccessToken = data.body['access_token'];
   this.api.setAccessToken(userAccessToken);
   return data.body;
 }
}

module.exports = SpotifyService;