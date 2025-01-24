# YTM Beautifier
## [Get it from the Chrome Web Store!](https://chromewebstore.google.com/detail/youtube-music-beautifier/mfgecbliilfimjghneojngcbificbdpa?hl=en)
## Extension for YouTube Music's Web Client

- Accurate Time-Synced Lyrics using the same YTM data from the mobile app's time-synced lyrics (acquired via [ytmusicapi](https://github.com/sigma67/ytmusicapi))
  - Backup sources like MusixMatch and NetEase (using [syncedlyrics](https://github.com/moehmeni/syncedlyrics)) when YTM does not have time-synced lyrics
- Beautiful fullscreen view including **animated** backgrounds to match album art (akin to Apple Music's)
- Control YouTube music without leaving the fullscreen view
![Example Image](https://github.com/nwvbug/Better-YouTubeMusic/blob/main/examples/lyrics-ex-1.png?raw=true)

## How to use

#### It's about as simple as it can get. Install the extension through the [Chrome Web Store](https://chromewebstore.google.com/detail/youtube-music-beautifier/mfgecbliilfimjghneojngcbificbdpa?hl=en) 
When in YouTube Music, activate the extension by going to the top right of your window and clicking on the icon. Then, just click the "Open Pretty Fullscreen" button. Done! The extension will work by itself now. 

## Details & customization

There are a few more things that are good to know:
- Click on the microphone icon at the bottom left of the album art to toggle whether the extension shows lyrics or not
  - Also, if the microphone is pulsing between grey and white, it is searching for a lyrics match.
  - and if the microphone is solidly greyed out, it failed to find lyrics for your song.
- You can know whether the extension is using official lyrics (gotten from YouTube) or unofficial lyrics based on the presence of the clock icon at the bottom right of the album art.
  - If it is not there, you are using official lyrics that should be accurate.
  - If it is there, that means you are using one of the backup lyric databases. You can click on the clock to set a lyric offset in case the lyric timing is not accurate. Your offsets are saved to your Chrome's storage.
- There is no settings menu in v1.0.0. However, that is coming soon (with the release of a performance mode)

## How it works

- Content script of the extension watches for mutations on the web app, and sends them to the extension's page.
- The extension then displays the information and requests lyrics from the [unofficial youtube music api](https://github.com/sigma67/ytmusicapi)
- Extension page can send information back to YTM which allows for play/pause back/skip
- Backgrounds done with JS Canvas

![Example Image](https://github.com/nwvbug/Better-YouTubeMusic/blob/main/examples/lyrics-ex-2.png?raw=true)

If there are no lyrics found (on YouTube Music, MusixMatch, or NetEase) the app simply displays a nice fullscreen view.
![Example Image](https://github.com/nwvbug/Better-YouTubeMusic/blob/main/examples/no-lyrics-ex.png?raw=true)

## Future Features
- Connectivity!
  - Use your phone or other device to control your YouTube Music! Similar to how Spotify lets you control media playback between devices.
  - Watch lyrics & see song info on a different device than the one playing it.
- Background optimization
  - Upgrade from Canvas to WebGL
- Community-based offset timings for unofficial sources
  - Sometimes, the unoffical times can be incorrect. You can adjust the timings for these lyrics, but in the future, these edits can be collected and used when someone else in the community listens to the same song.
- Queue management
  - Manage your upcoming and past songs through YTM Beautifier instead of having to return to the YTM webapp.

## Info
Privacy policy for the extension can be found at https://ytm.nwvbug.com/privacy

## Running your own server
If you wish to:
- fork
- contribute
- self-host the lyrics server

then this next section is probably for you. Otherwise, feel free to install normally.
The lyrics server runs on flask. You can run it in debug mode by simply running the python file ```main.py``` in the terminal.
What packages do I need?
- ```Flask```
- ```flask-cors```
- ```syncedlyrics```
- ```ytmusicapi```

All of these can be found on pip.

With the server running, change the url on line ```65``` in ```reciever.js``` to match the url your Flask server is running on.
Done! You can load the unpacked extension into your Chrome and it will work.
