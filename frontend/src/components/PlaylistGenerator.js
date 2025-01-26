import React, { useState } from 'react';

function PlaylistGenerator() {
    const [input, setInput] = useState(' ');
    const [playlist, setPlaylist] = useState(null);

    const generatePlaylist = async () => {
        const response = await fetch('http://localhost:8888/api/playlist/generate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ input })
        });

        const data = await response.json();
    }

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
              src={playlist}
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