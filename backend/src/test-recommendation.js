require('dotenv').config();

const RecommendationService = require('./services/recommendation');

async function testRecommendation() {
  const recommender = new RecommendationService();
  const playlist = await recommender.generatePlaylist("upbeat rock music like AC/DC");
  console.log(playlist.slice(0, 2));
}

testRecommendation();