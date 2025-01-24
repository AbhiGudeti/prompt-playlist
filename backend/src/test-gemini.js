// require('dotenv').config();
// const GeminiService = require('./services/gemini');

async function testGemini() {
  const gemini = new GeminiService();
  try {
    const result = await gemini.getKeywords("I want something upbeat like The Weeknd but with more rock elements");
    console.log('Keywords:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testGemini();