import React, { useState } from 'react';

function PlaylistGenerator() {
    const [input, setInput] = useState(' ');
    const [playlist, setPlaylist] = useState(null);

    const generatePlaylist = async () => {
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
    };

    return (
        <div>
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your music preferences..."
          />
          <button onClick={generatePlaylist}>Generate Playlist</button>
          {playlist && (
  <iframe 
    src={`https://open.spotify.com/embed/playlist/${playlist.split('/').pop()}`}
    width="300" 
    height="380" 
    frameBorder="0" 
    allowtransparency="true" 
    allow="encrypted-media"
  />
)}
        </div>
    );
}

export default PlaylistGenerator;