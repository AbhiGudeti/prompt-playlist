const express = require('express');
const router = express.Router();
const RecommendationService = require('../../services/recommendation');

const recommender = new RecommendationService();

router.post('/generate', async (req, res) => {
  try {
    const { input } = req.body;
    const playlist = await recommender.generatePlaylist(input);
    res.json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;