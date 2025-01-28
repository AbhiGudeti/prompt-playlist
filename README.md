PromptPlaylistGenerate Spotify playlists using natural language prompts.
PrerequisitesBefore setting up the project, ensure you have the following installed:
Node.js and npm
PostgreSQL
Spotify Developer Account
Google AI Studio Account (Gemini API)
Setup1. Clone the Repositorygit clone [repository-url]
cd PromptPlaylist2. Install Dependenciesnpm install
cd frontend
npm install3. Create a .env FileIn the root directory, create a .env file and add the following environment variables:
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
GEMINI_API_KEY=your_gemini_api_key4. Start the ServersTerminal 1 - Start the Backendcd backend/src
node index.jsTerminal 2 - Start the Frontendcd frontend
npm start5. Authenticate with SpotifyVisit the following URL in your browser to authenticate with Spotify:
http://localhost:8888/spotify-auth6. Access the ApplicationOnce authenticated, use the app at:
http://localhost:3000API KeysGet Spotify credentials from: Spotify Developer Dashboard
Get a Gemini API key from: Google AI Studio
This project allows users to create personalized Spotify playlists by providing natural language prompts, leveraging AI for enhanced music discovery.
