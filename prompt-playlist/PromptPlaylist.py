import requests
import time
from datetime import datetime, timedelta
from pathlib import Path
import json
import spacy
import spotipy
import numpy as np
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# Configuration
class Config:
    CACHE_FILE = "spotify_songs_cache.json"
    CACHE_EXPIRY_DAYS = 7
    NVIDIA_API_KEY = "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"
    NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
    SPOTIFY_RATE_LIMIT = 50
    SPOTIFY_RATE_LIMIT_WINDOW = 60
    SPOTIFY_CLIENT_ID = "9223e7167cb54971bdc5efd8d6190f24"
    SPOTIFY_CLIENT_SECRET = "6c003c3b1eb64f359bef7c7fe1cf376b"
    SPOTIFY_REDIRECT_URI = "http://localhost:8888/callback"


class SpotifyHelper:
    def __init__(self):
        self.sp = Spotify(auth_manager=SpotifyOAuth(
            client_id=Config.SPOTIFY_CLIENT_ID,
            client_secret=Config.SPOTIFY_CLIENT_SECRET,
            redirect_uri=Config.SPOTIFY_REDIRECT_URI,
            scope="playlist-modify-private"
        ))
        self.nlp = spacy.load("en_core_web_sm")

    @staticmethod
    def fetch_with_retry(func, *args, max_retries=3, initial_delay=1):
        """Helper function to handle API retries with rate limiting"""
        last_request_time = time.time()
        for attempt in range(max_retries):
            try:
                if time.time() - last_request_time < Config.SPOTIFY_RATE_LIMIT_WINDOW / Config.SPOTIFY_RATE_LIMIT:
                    time.sleep(Config.SPOTIFY_RATE_LIMIT_WINDOW / Config.SPOTIFY_RATE_LIMIT - (
                                time.time() - last_request_time))
                response = func(*args)
                last_request_time = time.time()
                return response
            except spotipy.exceptions.SpotifyException as e:
                if e.http_status == 429:
                    retry_after = int(e.headers.get('Retry-After', initial_delay * (2 ** attempt)))
                    print(f"Rate limited. Waiting {retry_after} seconds...")
                    time.sleep(retry_after)
                    continue
                elif attempt == max_retries - 1:
                    print(f"Failed after {max_retries} attempts: {e}")
                    return None
                time.sleep(initial_delay * (2 ** attempt))

    def batch_audio_features(self, track_ids):
        """Process audio features in batches"""
        features = []
        for i in range(0, len(track_ids), 20):
            batch = track_ids[i:i + 20]
            batch_features = self.fetch_with_retry(lambda: self.sp.audio_features(batch))
            if batch_features:
                features.extend(batch_features)
            time.sleep(1)
        return features


class SongDatabase:
    def __init__(self, spotify_helper):
        self.spotify = spotify_helper
        self.songs = []
        self.genres = set()
        self.last_updated = None
        self.load_cache()

    def save_cache(self):
        """Save the songs database to cache"""
        cache_data = {
            'songs': self.songs,
            'genres': list(self.genres),
            'last_updated': datetime.now().isoformat()
        }
        with open(Config.CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(cache_data, f, ensure_ascii=False, indent=2)
        print(f"Cache saved with {len(self.songs)} songs and {len(self.genres)} genres")

    def load_cache(self):
        """Load the songs database from cache if valid"""
        if not Path(Config.CACHE_FILE).exists():
            return False

        try:
            with open(Config.CACHE_FILE, 'r', encoding='utf-8') as f:
                cache_data = json.load(f)

            last_updated = datetime.fromisoformat(cache_data['last_updated'])
            if datetime.now() - last_updated > timedelta(days=Config.CACHE_EXPIRY_DAYS):
                return False

            self.songs = cache_data['songs']
            self.genres = set(cache_data['genres'])
            self.last_updated = last_updated
            return True

        except Exception as e:
            print(f"Error loading cache: {e}")
            return False

    def needs_update(self):
        """Check if database needs updating"""
        return (
                not self.songs or
                not self.last_updated or
                datetime.now() - self.last_updated > timedelta(days=Config.CACHE_EXPIRY_DAYS)
        )

    def build_database(self, num_songs=200, min_genres=20):
        """Build or rebuild the songs database"""
        if not self.needs_update():
            print("Database is up to date!")
            return

        self.songs = []
        self.genres = set()
        song_set = set()
        playlists_processed = 0
        max_playlists = 50

        def process_tracks_batch(tracks):
            if not tracks:
                return []

            valid_tracks = []
            track_ids = []
            for track in tracks:
                if not track['track'] or track['track']['id'] in song_set:
                    continue
                valid_tracks.append(track['track'])
                track_ids.append(track['track']['id'])

            if not track_ids:
                return []

            audio_features = self.spotify.batch_audio_features(track_ids)
            audio_features_map = {af['id']: af for af in audio_features if af}

            artist_ids = list(set(track['artists'][0]['id'] for track in valid_tracks))
            artists_map = {}

            for i in range(0, len(artist_ids), 50):
                batch_artists = self.spotify.fetch_with_retry(
                    lambda: self.spotify.sp.artists(artist_ids[i:i + 50])
                )
                if batch_artists and 'artists' in batch_artists:
                    artists_map.update({artist['id']: artist for artist in batch_artists['artists']})
                time.sleep(1)

            processed_tracks = []
            for track in valid_tracks:
                track_id = track['id']
                artist_id = track['artists'][0]['id']

                if track_id not in audio_features_map or artist_id not in artists_map:
                    continue

                artist = artists_map[artist_id]
                genres = artist['genres']
                self.genres.update(genres)

                song_data = {
                    'id': track_id,
                    'name': track['name'],
                    'artist': track['artists'][0]['name'],
                    'popularity': track['popularity'],
                    'genres': genres,
                    'audio_features': audio_features_map[track_id]
                }
                processed_tracks.append(song_data)
                song_set.add(track_id)

            return processed_tracks

        try:
            # Process featured playlists
            playlists = self.spotify.fetch_with_retry(
                lambda: self.spotify.sp.featured_playlists(limit=20)['playlists']['items']
            )

            # Add category playlists
            categories = self.spotify.fetch_with_retry(
                lambda: self.spotify.sp.categories(limit=20)
            )
            if categories:
                for category in categories['categories']['items']:
                    if len(self.songs) >= num_songs and len(self.genres) >= min_genres:
                        break

                    category_playlists = self.spotify.fetch_with_retry(
                        lambda: self.spotify.sp.category_playlists(category['id'], limit=5)
                    )
                    if category_playlists:
                        playlists.extend(category_playlists['playlists']['items'])
                    time.sleep(1)

            # Process playlists
            for playlist in playlists:
                if (playlists_processed >= max_playlists or
                        (len(self.songs) >= num_songs and len(self.genres) >= min_genres)):
                    break

                tracks = self.spotify.fetch_with_retry(
                    lambda: self.spotify.sp.playlist_tracks(playlist['id'], limit=30)['items']
                )
                if tracks:
                    self.songs.extend(process_tracks_batch(tracks))
                playlists_processed += 1
                time.sleep(1)

            # Save results
            self.last_updated = datetime.now()
            self.save_cache()

        except Exception as e:
            print(f"Error building database: {e}")


class MusicRecommender:
    def __init__(self, spotify_helper):
        self.spotify = spotify_helper

    def process_input(self, user_input):
        """Process user input to extract music-related keywords"""
        headers = {
            "Authorization": f"Bearer {Config.NVIDIA_API_KEY}",
            "Content-Type": "application/json"
        }

        data = {
            "model": "meta/llama-3.2-3b-instruct",
            "messages": [{
                "role": "user",
                "content": f"Given the user input '{user_input}', suggest keywords or features that describe the music. Focus on genre, mood, and style. Format your response as a simple bulleted list without headers or sections."
            }],
            "temperature": 0.7,
            "top_p": 0.7,
            "max_tokens": 100
        }

        try:
            response = requests.post(Config.NVIDIA_API_URL, headers=headers, json=data)
            response.raise_for_status()
            content = response.json()['choices'][0]['message']['content']

            keywords = self._extract_keywords(content)
            if len(user_input) > 2 and user_input.lower() not in keywords:
                keywords.insert(0, user_input.lower())

            return keywords

        except Exception as e:
            print(f"Error with NVIDIA API: {e}")
            return [user_input.lower()]

    def _extract_keywords(self, content):
        """Extract clean keywords from LLM response"""
        keywords = []
        for line in content.lower().split('\n'):
            if '**' in line or not line.strip() or ':' in line:
                continue

            words = line.strip('* +').strip().replace(',', ' ').replace('(', ' ').replace(')', ' ').split()

            for word in words:
                word = word.strip('.,():*+-')
                if (len(word) > 2 and
                        not any(char in word for char in ':**()+-') and
                        not word.isdigit() and
                        word not in {'bpm', 'level', 'characteristics'}):
                    keywords.append(word)

        return list(dict.fromkeys(keywords))[:5]

    def get_recommendations(self, keywords, songs, num_recommendations=50):
        """Get song recommendations based on keywords and available songs"""
        if not keywords:
            return []

        search_query = ' '.join(keywords[:10])
        try:
            # Get seed track
            search_results = self.spotify.sp.search(q=search_query, type='track', limit=1)
            if not search_results['tracks']['items']:
                search_results = self.spotify.sp.search(q=keywords[0], type='track', limit=1)

            seed_track = search_results['tracks']['items'][0]
            target_features = self.spotify.sp.audio_features(seed_track['id'])[0]

            if not target_features:
                return []

            # Calculate similarities
            tfidf = TfidfVectorizer().fit_transform([search_query] + [' '.join(song['genres']) for song in songs])
            cosine_similarities = cosine_similarity(tfidf[0:1], tfidf[1:]).flatten()

            audio_feature_keys = ['danceability', 'energy', 'loudness', 'speechiness',
                                  'acousticness', 'instrumentalness', 'valence']

            audio_similarities = []
            for song in songs:
                song_features = song.get('audio_features', {})
                if not song_features:
                    continue
                similarity = sum(1 - abs(target_features[key] - song_features[key])
                                 for key in audio_feature_keys
                                 if key in target_features and key in song_features) / len(audio_feature_keys)
                audio_similarities.append(similarity)

            # Combine similarities and get top recommendations
            scores = cosine_similarities + np.array(audio_similarities)
            recommended_songs_idx = scores.argsort()[-num_recommendations:][::-1]

            return [songs[i] for i in recommended_songs_idx]

        except Exception as e:
            print(f"Error in get_recommendations: {e}")
            return []

    def create_playlist(self, tracks):
        """Create a Spotify playlist with recommended tracks"""
        if not tracks:
            print("No tracks to add to the playlist.")
            return None

        try:
            playlist = self.spotify.sp.user_playlist_create(
                self.spotify.sp.me()['id'],
                "Your Curated Playlist",
                public=False
            )
            self.spotify.sp.playlist_add_items(playlist['id'], [track['id'] for track in tracks])
            return playlist['external_urls']['spotify']
        except Exception as e:
            print(f"Error creating playlist: {e}")
            return None


def main():
    spotify_helper = SpotifyHelper()
    song_db = SongDatabase(spotify_helper)
    recommender = MusicRecommender(spotify_helper)

    # Build/update database if needed
    if song_db.needs_update():
        song_db.build_database()

    # Get user input and generate recommendations
    user_input = input("Describe the kind of music you want to hear: ")
    keywords = recommender.process_input(user_input)
    recommended_tracks = recommender.get_recommendations(keywords, song_db.songs)

    # Create and share playlist
    playlist_url = recommender.create_playlist(recommended_tracks)
    if playlist_url:
        print(f"Here's your playlist! {playlist_url}")
    else:
        print("Unable to create playlist.")


if __name__ == "__main__":
    main()