from flask import Flask, jsonify, send_file, Blueprint, request,abort,redirect
from flask_cors import CORS
from flask_socketio import SocketIO
from sockets import socket_events
import os
import lyrics

app = Flask(__name__)
socketio = SocketIO(app=app, cors_allowed_origins = "*")
socket_events(socketio)
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

@app.route("/assets/<image>")
def assets(image):
    try:
        file_path = os.path.join('extension', 'assets', image)
        return send_file(file_path)
    except FileNotFoundError:
        return abort(404)

@app.route("/live")
def live():
    with open('live.html', 'r', encoding='utf-8') as f:
        content = f.read()
    return content

@app.route('/js/<fil>')
def js(fil):
    try:
        file_path = os.path.join('extension', fil)
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return content
    except FileNotFoundError:
        return abort(404)
    
@app.route('/styles/<css>')
def styles(css):
    try:
        file_path = os.path.join('extension', css)
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return content
    except FileNotFoundError:
        return abort(404)

if __name__ == "__main__":
    socketio.run(host="0.0.0.0", port=7070, debug=True, app=app)
    

