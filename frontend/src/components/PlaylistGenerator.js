import React, { useState } from 'react';

function PlaylistGenerator() {
    const [input, setInput] = useState('');
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(false);
    const [genres, setGenres] = useState([]);

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
                setGenres(data.genres || []);
            }
        } catch (error) {
            console.error('Failed to generate playlist:', error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-sky-400 flex items-center justify-center p-8">
            <div className="w-full max-w-xl bg-white/20 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
                <h1 className="text-6xl font-bold text-white text-center mb-12 font-sans">
                    PromptPlaylist
                </h1>
                <div className="space-y-6 flex flex-col items-center">
                    <textarea
                        className="w-full p-6 bg-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 font-sans text-lg"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Describe the music you want to hear..."
                        rows="4"
                    />
                    {genres.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {genres.map((genre, idx) => (
                                <span 
                                    key={idx}
                                    className="px-3 py-1 bg-white/30 rounded-full text-white text-sm"
                                >
                                    {genre}
                                </span>
                            ))}
                        </div>
                    )}
                    <button
                        onClick={generatePlaylist}
                        disabled={loading}
                        className="px-8 py-4 bg-white/30 hover:bg-white/40 rounded-xl font-bold text-white transition-colors text-lg w-48"
                    >
                        {loading ? 'Generating...' : 'Generate'}
                    </button>
                    {playlist && (
                        // eslint-disable-next-line jsx-a11y/iframe-has-title
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