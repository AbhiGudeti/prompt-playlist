import time
import spacy
import spotipy
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from spotipy.oauth2 import SpotifyOAuth
from spotipy import Spotify

nlp = spacy.load("en_core_web_sm")

#PUT IN YOUR CLIENT ID & CLIENT SECRET ID FROM THE SPOTIFY API
sp = Spotify(auth_manager=SpotifyOAuth(
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_CLIENT_SECRET",
    redirect_uri="http://localhost:8888/callback",
    scope="playlist-modify-private"
))

SONGS = []
GENRES = set()


def process_input(user_input):
    doc = nlp(user_input)
    keywords = [token.lemma_ for token in doc if not token.is_stop and token.is_alpha]
    return keywords


def build_song_playlist(num_songs=100):
    global SONGS, GENRES
    try:
        playlists = sp.featured_playlists(limit=50)['playlists']['items']
    except spotipy.exceptions.SpotifyException as e:
        print("Error fetching featured playlists:", e)
        return

    for playlist in playlists:
        try:
            tracks = sp.playlist_tracks(playlist['id'])['items']
        except spotipy.exceptions.SpotifyException as e:
            print(f"Error fetching tracks for playlist {playlist['name']}: {e}")
            continue

        for track in tracks:
            if track['track'] and len(SONGS) < num_songs:
                track_info = track['track']

                try:
                    audio_features = sp.audio_features(track_info['id'])[0]
                    artist = sp.artist(track_info['artists'][0]['id'])
                except spotipy.exceptions.SpotifyException as e:
                    print(f"Error fetching details for track {track_info['name']}: {e}")
                    time.sleep(1)
                    continue

                if audio_features:
                    genres = artist['genres']
                    GENRES.update(genres)

                    SONGS.append({
                        'id': track_info['id'],
                        'name': track_info['name'],
                        'artist': track_info['artists'][0]['name'],
                        'popularity': track_info['popularity'],
                        'genres': genres,
                        'audio_features': audio_features
                    })

    return SONGS, GENRES


def get_recommendations(keywords, num_recommendations=10):
    tfidf = TfidfVectorizer().fit_transform([' '.join(keywords)] + [' '.join(song['genres']) for song in SONGS])
    cosine_similarities = cosine_similarity(tfidf[0:1], tfidf[1:]).flatten()

    audio_feature_keys = ['danceability', 'energy', 'loudness', 'speechiness', 'acousticness', 'instrumentalness',
                          'liveness', 'valence', 'tempo']

    target_features = \
    sp.audio_features(sp.search(q=' '.join(keywords), type='track', limit=1)['tracks']['items'][0]['id'])[0]

    audio_similarities = []
    for song in SONGS:
        song_features = song['audio_features']
        similarity = sum(1 - abs(target_features[key] - song_features[key]) for key in audio_feature_keys) / len(
            audio_feature_keys)
        audio_similarities.append(similarity)

    combined_similarities = 0.6 * np.array(cosine_similarities) + 0.4 * np.array(audio_similarities)
    top_indices = combined_similarities.argsort()[-num_recommendations * 2:][::-1]
    recommendations = []
    genres_used = set()

    for x in top_indices:
        song = SONGS[x]
        if len(set(song['genres']) & genres_used) == 0 or np.random.random() > 0.7:
            recommendations.append(song)
            genres_used.update(song['genres'])
        if len(recommendations) == num_recommendations:
            break

    recommendations.sort(key=lambda x: x['popularity'], reverse=True)

    return recommendations


def create_playlist(tracks):
    playlist = sp.user_playlist_create(sp.me()['id'], "Your Curated Playlist", public=False)
    sp.playlist_add_items(playlist['id'], [track['id'] for track in tracks])
    return playlist['external_urls']['spotify']


def main():
    build_song_playlist()

    user_input = input("Describe the kind of music you want to hear: ")
    keywords = process_input(user_input)
    recommended_tracks = get_recommendations(keywords)
    playlist_url = create_playlist(recommended_tracks)
    print(f"Here's your playlist! {playlist_url}")


if __name__ == "__main__":
    main()
