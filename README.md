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
When in YouTube Music, activate the extension by going to the top right of your window and clicking on the icon. Then, just click the "Open Pretty Fullscreen" button. Done! The extension will work by itself now. 
![Example Image](https://github.com/nwvbug/YouTubeMusic-Beautifier/blob/main/examples/ss3.png?raw=true)

## What to expect from v1.2.0 (Next Version)
- I don't know yet! I have some ideas in the works, though. Check back here for updates.

## How it works

- Content script of the extension watches for mutations on the web app, and sends them to the extension's page.
- The extension then displays the information and requests lyrics from the [unofficial youtube music api](https://github.com/sigma67/ytmusicapi)
- Extension page can send information back to YTM which allows for play/pause back/skip
- Backgrounds done with JS Canvas

![Example Image](https://github.com/nwvbug/YouTubeMusic-Beautifier/blob/main/examples/ss4.png?raw=true)

![Example Image](https://github.com/nwvbug/Better-YouTubeMusic/blob/main/examples/ss5.png?raw=true)


## Info
Privacy policy for the extension can be found at https://ytm.nwvbug.com/privacy

Specific info about Live Share & Remote Control can be found at https://ytm.nwvbug.com/connectivity

## Support
I make this primarily as a passion project and something that I wanted to exist. As such, do not feel like you have to pay anything to use the extension. All the features are free for a reason! However, if you wish to support the project, I have a buymeacoffee page here: https://buymeacoffee.com/nvemuri 
