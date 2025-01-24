const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

setTimeout(() => {
  const express = require('express');
  const playlistRoutes = require('./api/routes/playlist');

  console.log('Environment check:', {
    GEMINI: process.env.GEMINI_API_KEY ? 'Set' : 'Not set',
    SPOTIFY: process.env.SPOTIFY_CLIENT_ID ? 'Set' : 'Not set'
  });

  const app = express();
  app.use(express.json());
  app.use('/api/playlist', playlistRoutes);

  const port = 8888;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}, 1000);