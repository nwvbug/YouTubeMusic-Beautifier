# Better YTM
## Extension for YouTube Music's Web Client

- Accurate Time-Synced Lyrics using the same YTM data from the mobile app's time-synced lyrics
  - Backup sources like MusixMatch and NetEase (using [syncedlyrics](https://github.com/moehmeni/syncedlyrics)) when YTM does not have time-synced lyrics
- Beautiful fullscreen view including **animated** backgrounds to match album art (akin to Apple Music's)
- Control YouTube music without leaving the fullscreen view
![Example Image](https://github.com/nwvbug/Better-YouTubeMusic/blob/main/examples/lyrics-ex-1.png?raw=true)

## How it works

- Content script of the extension watches for mutations on the web app, and sends them to the extension's page.
- The extension then displays the information and requests lyrics from the [unofficial youtube music api](https://github.com/sigma67/ytmusicapi)
- Extension page can send information back to YTM which allows for play/pause back/skip
- Backgrounds done with JS Canvas

![Example Image](https://github.com/nwvbug/Better-YouTubeMusic/blob/main/examples/lyrics-ex-2.png?raw=true)

If there are no lyrics found (on YouTube Music, MusixMatch, or NetEase) the app simply displays a nice fullscreen view.
![Example Image](https://github.com/nwvbug/Better-YouTubeMusic/blob/main/examples/no-lyrics-ex.png?raw=true)
