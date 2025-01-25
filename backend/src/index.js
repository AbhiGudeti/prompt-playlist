const path = require('path');
const SpotifyService = require('./services/spotify');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

setTimeout(() => {
 const express = require('express');
 const playlistRoutes = require('./api/routes/playlist');
 const spotify = new SpotifyService();

 const app = express();
 app.use(express.json());
 app.use('/api/playlist', playlistRoutes);

 app.get('/login', (_req, res) => {
  const authUrl = spotify.authorize();  // No await needed
  console.log('Auth URL:', authUrl); // Debug
  res.redirect(authUrl);
});

 app.get('/callback', async (req, res) => {
   const { code } = req.query;
   try {
     const data = await spotify.api.authorizationCodeGrant(code);
     spotify.api.setAccessToken(data.body['access_token']);
     spotify.api.setRefreshToken(data.body['refresh_token']);
     res.redirect('/');
   } catch (error) {
     res.status(500).send(error.message);
   }
 });

 app.get('/', (_req, res) => {
  res.send('Successfully authenticated with Spotify! You can close this window.');
});

 const port = 8888;
 app.listen(port, () => console.log(`Server running on port ${port}`));
}, 1000);