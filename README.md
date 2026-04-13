# YTM Beautifier
## [Get it from the Chrome Web Store!](https://chromewebstore.google.com/detail/youtube-music-beautifier/mfgecbliilfimjghneojngcbificbdpa?hl=en)
## Extension for YouTube Music's Web Client

- Accurate Time-Synced Lyrics using the same YTM data from the mobile app's time-synced lyrics (acquired via [ytmusicapi](https://github.com/sigma67/ytmusicapi))
  - Backup sources like MusixMatch and NetEase (using [syncedlyrics](https://github.com/moehmeni/syncedlyrics)) when YTM does not have time-synced lyrics
- Live Share and Remote Control: Control your PC's Playback from your phone (or other device)
- Beautiful fullscreen view including **animated** backgrounds to match album art (akin to Apple Music's)
  
![Example Image](https://ytm.nwvbug.com/static/songchoices/dieforyou.png)

## How to use

#### It's about as simple as it can get. Install the extension through the [Chrome Web Store](https://chromewebstore.google.com/detail/youtube-music-beautifier/mfgecbliilfimjghneojngcbificbdpa?hl=en) 
When in YouTube Music, activate the extension by going to the top right of your window and clicking on the icon. Then, just click the "Open Beautifier" button. Done! The extension will work by itself now. 
![Example Image](https://github.com/nwvbug/YouTubeMusic-Beautifier/blob/main/examples/ss3.png?raw=true)

## Toolbar
![Toolbar Image](https://github.com/nwvbug/YouTubeMusic-Beautifier/blob/main/examples/toolbar.png?raw=true)
- Clock Image: Change the Lyric Offset if they are ahead or behind of the music
- Microphone with Eye: Show/Hide Lyrics
- Microphone with Reload: Re-search for lyrics using a different query (If incorrect lyrics found)
- Sharing Icon (rectangle and phone): Open the Live Share / Remote Control menu
- Fullscreen Icon: Enter or Exit Fullscreen
- Settings Icon: Open the Settings menu

## Features Coming Soon (Next Version)
- Word-level lyric sync, not just line level (this already works in testing, just need to make sure its stable!)
- System to start PC playback from phone (more of a Remote Control Dashboard as opposed to a viewer with controls)
- Auto Offset Detection for Live (Detect the ping time and implement an offset so that all devices are *exactly* in sync, down to a few ms)

## How it works

## How it works

- **Metadata Scraping:** A content script uses a MutationObserver to watch the YouTube Music web app for high-level state changes like a new song starting.
- **Millisecond-Precise Timing:** To get the current song's progress, the extension injects a bridge script into the YTM page. This script accesses YTM's internal player API and broadcasts highly precise, lag-free timestamps back to the isolated content script via `window.postMessage`.
- **Clock Synchronization:** Rather than flooding the extension with constant message updates, the web app interface receives an anchor time and uses a local `requestAnimationFrame` loop to interpolate the current playback millisecond. 
- **Lyrics:** The extension requests synced lyrics from the [unofficial youtube music api](https://github.com/sigma67/ytmusicapi).
- **Playback Control:** The extension page can send commands back through the service worker to the content script, allowing for remote play/pause/skip functionality.
- **Visuals:** The dynamic animated backgrounds are rendered using the JS Canvas API.

![Example Image](https://github.com/nwvbug/YouTubeMusic-Beautifier/blob/main/examples/ss4.png?raw=true)

![Example Image](https://github.com/nwvbug/Better-YouTubeMusic/blob/main/examples/ss5.png?raw=true)


## Info
Privacy policy for the extension can be found at https://ytm.nwvbug.com/privacy

Specific info about Live Share & Remote Control can be found at https://ytm.nwvbug.com/connectivity

## Support
I make this primarily as a passion project and something that I wanted to exist. As such, do not feel like you have to pay anything to use the extension. All the features are free for a reason! However, if you wish to support the project, I have a buymeacoffee page here: https://buymeacoffee.com/nvemuri 
