import React, { useState } from 'react';

function PlaylistGenerator() {
    const [input, setInput] = useState(' ');
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(false);

    const generatePlaylist = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8888/api/playlist/generate', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ input })
            });
    
            const data = await response.json();
            if (data.success) {
                setPlaylist(data.playlist);
            } else {
                console.error('Error:', data.error);
            }
        } catch (error) {
            console.error('Failed to generate playlist:', error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#3E2723] flex items-center justify-center p-8">
          <div className="w-full max-w-xl">
            <h1 className="text-6xl font-bold text-white text-center mb-12 font-sans">
              PromptPlaylist
            </h1>
            <div className="space-y-6 flex flex-col items-center">
              <textarea
                className="w-full p-6 bg-[#4E342E] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D6E63] font-sans text-lg"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe the music you want to hear..."
                rows="4"
              />
              <button
                onClick={generatePlaylist}
                disabled={loading}
                className="px-8 py-4 bg-[#8D6E63] hover:bg-[#795548] rounded-xl font-bold text-white transition-colors text-lg w-48"
              >
                {loading ? 'Generating...' : 'Generate'}
              </button>
              {playlist && (
                <iframe
                  src={`https://open.spotify.com/embed/playlist/${playlist.split('/').pop()}`}
                  className="w-full h-[450px] rounded-xl mt-8"
                  frameBorder="0"
                  allowtransparency="true"
                  allow="encrypted-media"
                />
              )}
            </div>
          </div>
        </div>
      );
}

export default PlaylistGenerator;