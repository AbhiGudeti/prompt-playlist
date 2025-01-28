# PromptPlaylist

Generate Spotify playlists using natural language prompts.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) and npm
- [Spotify Developer Account](https://developer.spotify.com/dashboard)
- [Google AI Studio Account (Gemini API)](https://makersuite.google.com/app/apikey)

## Setup

### 1. Clone the Repository
```bash
git clone https://github.com/AbhiGudeti/prompt-playlist
cd PromptPlaylist
```

### 2. Install Dependencies
```bash
npm install
cd frontend
npm install
```

### 3. Create a `.env` File

In the root directory, create a `.env` file and add the following environment variables:
```plaintext
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Start the Servers

#### Terminal 1 - Start the Backend
```bash
cd backend/src
node index.js
```

#### Terminal 2 - Start the Frontend
```bash
cd frontend
npm start
```

### 5. Authenticate with Spotify

Visit the following URL in your browser to authenticate with Spotify:
```
http://localhost:8888/spotify-auth
```

### 6. Access the Application

Once authenticated, use the app at:
```
http://localhost:3000
```

## API Keys

- Get Spotify credentials from: [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- Get a Gemini API key from: [Google AI Studio](https://makersuite.google.com/app/apikey)

---
This project allows users to create personalized Spotify playlists by providing natural language prompts, leveraging AI for enhanced music discovery.

