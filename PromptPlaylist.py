import spacy
import spotipy
from spotipy.oauth2 import SpotifyOAuth

nlp = spacy.load("en_core_web_sm")
sp = spotipy.Spotify(auth_manager = SpotifyOAuth(scope = "playlist-modify-private"))
SONGS = []
GENRES = set()

def build_song_playlist(num_songs = 1000):
    global SONGS, GENRES


def process_input(user_input):
    doc = nlp(user_input)
    keywords = [token.lemma_ for token in doc if not token.is_stop and token.is_alpha]
    return keywords


