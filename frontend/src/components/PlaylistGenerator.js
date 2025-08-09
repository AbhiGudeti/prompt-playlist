import React, { useState } from 'react';

function PlaylistGenerator() {
    const [input, setInput] = useState('');
    const [playlist, setPlaylist] = useState(null);
    const [embedError, setEmbedError] = useState(false);
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
                setEmbedError(false);
                setPlaylist(data.playlist);
                setGenres(data.genres || []);
            }
        } catch (error) {
            console.error('Failed to generate playlist:', error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-spotify-dark text-spotify-text">
            <header className="px-8 py-6 border-b border-white/10 bg-spotify-black">
                <h1 className="text-3xl font-bold">PromptPlaylist</h1>
            </header>
            <main className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-6 p-6 md:p-8">
                {/* Left: Prompt Panel */}
                <section className="bg-spotify-darkElevated rounded-xl p-6 md:sticky md:top-6 h-fit">
                    <h2 className="text-xl font-semibold mb-4">Describe the vibe</h2>
                    <textarea
                        className="w-full p-4 bg-spotify-card rounded-lg text-spotify-text placeholder-spotify-subtext focus:outline-none focus:ring-2 focus:ring-spotify-green font-sans text-base min-h-[140px]"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="e.g., Lo-fi beats for studying, like Nujabes and Bonobo"
                        rows="5"
                    />

                    {genres.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {genres.map((genre, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 bg-spotify-card rounded-full text-spotify-subtext text-sm"
                                >
                                    {genre}
                                </span>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={generatePlaylist}
                        disabled={loading}
                        className="mt-6 px-6 py-3 bg-spotify-green hover:bg-spotify-greenHover disabled:opacity-60 disabled:cursor-not-allowed rounded-full font-bold text-spotify-black transition-colors text-base"
                    >
                        {loading ? 'Generating...' : 'Generate'}
                    </button>
                </section>

                {/* Right: Playlist Panel */}
                <section className="bg-spotify-darkElevated rounded-xl p-6 min-h-[300px]">
                    <h2 className="text-xl font-semibold mb-4">Your playlist</h2>
                    {!playlist && (
                        <div className="text-spotify-subtext">Your generated Spotify playlist will appear here.</div>
                    )}
                    {playlist && (
                        <div>
                            {(() => {
                                let playlistId = playlist.id;
                                if (!playlistId && playlist.url) {
                                    try {
                                        const u = new URL(playlist.url);
                                        const parts = u.pathname.split('/');
                                        playlistId = parts[parts.length - 1];
                                    } catch (_) {
                                        // ignore
                                    }
                                }
                                const embedSrc = playlistId
                                    ? `https://open.spotify.com/embed/playlist/${encodeURIComponent(playlistId)}`
                                    : null;
                                return (
                                    <>
                                        {!embedError && embedSrc && (
                                            <iframe
                                                key={playlistId}
                                                title="Spotify playlist"
                                                src={embedSrc}
                                                className="w-full h-[500px] rounded-lg"
                                                frameBorder="0"
                                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                                loading="lazy"
                                                onError={() => setEmbedError(true)}
                                            />
                                        )}
                                        {(!embedSrc || embedError) && (
                                            <a
                                                href={playlist.url || (typeof playlist === 'string' ? playlist : '#')}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-block mt-4 px-5 py-3 bg-spotify-green hover:bg-spotify-greenHover rounded-full font-bold text-spotify-black"
                                            >
                                                Open in Spotify
                                            </a>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default PlaylistGenerator;