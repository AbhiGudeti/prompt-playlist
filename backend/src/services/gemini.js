const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    const key = process.env.GEMINI_API_KEY;
    console.log('Using Gemini key:', key?.slice(0, 10));
    this.genAI = new GoogleGenerativeAI(key);
  }

  async getKeywords(userInput) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Given this music preference: "${userInput}", return a JSON object with these properties: genres (array), moods (array), tempo (string), era (string), and similar_artists (array). Only return the JSON, no markdown or other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  }
}

module.exports = GeminiService;