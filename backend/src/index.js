const path = require('path');
const SpotifyService = require('./services/spotify');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

setTimeout(() => {
 const express = require('express');
 const cors = require('cors');
 const playlistRoutes = require('./api/routes/playlist');
 const spotify = new SpotifyService();

 const app = express();
 app.use(express.json());
 app.use(cors());
 app.use('/api/playlist', playlistRoutes);

 app.get('/spotify-auth', (_req, res) => {
   const authUrl = spotify.authorize();
   res.redirect(authUrl);
 });

 app.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    await spotify.handleCallback(code);
    res.redirect('http://localhost:8888');
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).send(error.message);
  }
});

 app.get('/', (_req, res) => {
   res.send('Successfully authenticated with Spotify! You can close this window.');
 });

 app.get('/auth-status', (_req, res) => {
   const isAuthenticated = spotify.isAuthenticated();
   res.json({ isAuthenticated });
 });

 const port = 8888;
 app.listen(port, () => console.log(`Server running on port ${port}`));
}, 1000);