const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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