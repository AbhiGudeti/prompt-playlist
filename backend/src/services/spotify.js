const SpotifyWebApi = require('spotify-web-api-node');

class SpotifyService {
    constructor() {
        this.api = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET
        });

        this.initializeToken();
    }

    async searchTracks(query) {
        await this.initializeToken();
        return this.api.searchTracks(query).then(data => data.body.tracks.items);
    }

    async initializeToken() {
        const data = await this.api.clientCredentialsGrant();
        this.api.setAccessToken(data.body['access_token']);
    }

    async createPlaylist(userId, tracks, name) {
        const playlist = await this.api.createPlaylist(userId, name, { public: true });
        await this.api.addTracksToPlaylist(playlist.body.id, tracks);

        return playlist.body.external_urls.spotify;
    }
}

module.exports = SpotifyService;