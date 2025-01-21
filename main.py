from flask import Flask, jsonify, send_file, Blueprint, request,abort,redirect
from flask_cors import CORS
import os
import lyrics

app = Flask(__name__)
CORS(app)

wsgi_app = app.wsgi_app

@app.route("/request-lyrics/<song_details>")
def request_lyrics(song_details):
    lyrics_text = lyrics.get_ytm_lyrics(song_details)
    if lyrics_text is None:
        return "no_lyrics_found"
    return lyrics_text

@app.route("/")
def home():
    return redirect("https://github.com/nwvbug/YouTubeMusic-Beautifier")

@app.route("/privacy")
def privacy():
    with open('privacypolicy.html', 'r', encoding='utf-8') as f:
        content = f.read()
    return content

@app.route("/assets/logo")
def logo():
    return send_file("icon.png", mimetype="image/gif")


if __name__ == "__main__":
    app.run(debug=True, port=7070)

