const SpotifyWebApi = require('spotify-web-api-node');
let accessToken = null;

class SpotifyService {
  constructor() {
    this.api = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: 'http://localhost:8888/callback'
    });
  }

  async searchTracks(query) {
    if (!accessToken) {
      throw new Error('Please authenticate first at /spotify-auth');
    }
    this.api.setAccessToken(accessToken);
    const results = await this.api.searchTracks(query);
    return results.body.tracks.items;
  }

  async createPlaylist(tracks) {
    if (!accessToken) {
      throw new Error('Please authenticate first at /spotify-auth');
    }
    try {
      this.api.setAccessToken(accessToken);
      const me = await this.api.getMe();
      console.log('User data:', me); // Debug log
      const userId = me.body.id;
      
      const playlist = await this.api.createPlaylist(userId, {
        name: "Generated Playlist",
        description: 'Created by PromptPlaylist',
        public: true
      });
      
      const uris = tracks.slice(0, 20).map(t => t.uri);
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
    accessToken = data.body['access_token'];
    this.api.setAccessToken(accessToken);
    return data.body;
  }
}

module.exports = SpotifyService;