var current_song;
var current_next;
var current_prev;
var debug_incr = 0;
var queue_cache;
var queue_hash;
var current_queue_index;
var compareAgainst = "data:image/gif;base64"
var totalDuration
var last_lyrics_refresh = ""
var current_song_title
var current_song_artist
var current_song_album
var current_song_album_art
var lyrics_code
var lyrics_fresh = false;
var tim = []
var lyrics = []
var words = []
var started = false

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  chrome.runtime.sendMessage({ type: "WEBAPP_ACKNOWLEDGE" });
  console.log("Message Recieved. Type: "+request.type+" Payload:")
  console.log(request.payload)

  switch (request.type) {
    case "STATE_UPDATE":
      onUpdate(request.payload)
      break;
    case "LYRICS_RESULT":
      onLyricsResult(request.payload)
      break;
    case "WEBAPP_CLIENT_DISCONNECTED":
      clientDisconnected(request.payload)
      break;
    case "WEBAPP_ROOM_CREATED":
      generateQrCode(request.payload)
      break;
    case "WEBAPP_CLIENT_JOINED":
      clientJoined(request.payload)
      break;
    case "YTM_TAB_FOCUSED":
      console.log("YTM Tab Focused")
      doAnimation = false
      break;
    case "YTM_TAB_UNFOCUSED":
      console.log("YTM Tab Unfocused")
      doAnimation = true
      break;
  }
});

function onUpdate(data){
    console.log("ONUpdate");
    updateSyncState(data); // New call to update the sync state in displayer.js

    const isNewSong = current_song != data.song_identifier;

    if (isNewSong){
        console.log("New Song")
        rerolled = false;
        loadLyricOption() // grey out both lyric buttons while searching
        showLyricsLoading() // lyrics pane shows the pulsing logo
        current_song = data.song_identifier
        totalDuration = data.total_time
        hideBackground()
        setTimeout(() => {
           showBackground()
        }, 1000);
        console.log("song id: "+data.song_identifier)
        document.getElementById("title").innerText = data.song_name;
        if (data.song_album.length > 40){
            document.getElementById("artist-album").innerText = data.song_artist + " • " + data.song_album.substring(0,27)+"..."
        } else {
            document.getElementById("artist-album").innerText = data.song_artist + " • " + data.song_album

        }
        document.title = data.song_name + " | YTM-B"
    }

    // Middleman is the source of truth for the lyric offset (it loads the
    // saved per-song value from storage asynchronously).
    if (incomingSecondOffset != data["offset-for-display"]){
        incomingSecondOffset = data["offset-for-display"]
        document.getElementById("offset").innerText = -1 * incomingSecondOffset
    }

    // Update artwork whenever a real URL arrives, not just on song change:
    // the scrape can race YTM's lazy loader at song start, so the first
    // few updates for a song may carry a placeholder or stale image.
    if (data.album_art && !data.album_art.startsWith(compareAgainst) && data.album_art != current_song_album_art){
        current_song_album_art = data.album_art
        document.getElementById("album-image").src = data.album_art;
        createAnimatedBackground(data.album_art)
    }

    if (data.lyrics_searching){
        // Search still in flight: keep the loading state (set on new song / reroll).
        // The LYRICS_RESULT message will resolve it.
    } else if (data.lyric_freshness){
        showLyrics(data)
    } else if (data.searched_for_lyrics){
        console.log("no lyrics found")
        showNoLyrics()
    }

    if (data.pause_state == "Pause" && document.getElementById("pauseplaybutton").src !="/assets/pause.png"){
        console.log("Playing")
        document.getElementById("pauseplaybutton").src = "/assets/pause.png"
    } else if (data.pause_state == "Play" && document.getElementById("pauseplaybutton").src != "/assets/play.png"){
        console.log("Paused")
        document.getElementById("pauseplaybutton").src = "/assets/play.png"
    }

    if ((data.live) && (!live)){ //if middleman says live and page says not, trust middleman
      live = true
      document.getElementById("shareinfo").style.display = ""
      generateQrCode(data.room_code)
    }
   if (!started){
      started = true
      document.getElementById("loader").style.display = "none"
   }
}

// Handles the immediate push from middleman when a lyrics search resolves,
// so the UI doesn't have to wait for the next STATE_UPDATE poll.
function onLyricsResult(data){
    console.log("Lyrics result received. Found: "+data.found)
    // Ignore results for a song we're no longer on (stale fetch)
    if (current_song && data.song_identifier && data.song_identifier != current_song) return;
    if (data.found){
        showLyrics(data)
    } else {
        showNoLyrics()
    }
}

// Lyrics are available: swap the loader for the lyrics and enable the buttons.
function showLyrics(data){
    lyricsState = "available"
    hideLyricsLoading()
    showLyricOption()
    if (data.song_identifier != last_lyrics_refresh || data.lyrics_code != lyrics_code){
        refreshAndDisplayLyrics(data)
    }
    if (userPrefersLyricsVisible){
        showLyricsView()
    }
}

// No lyrics for this song: hide the pane, grey out the show/hide button.
function showNoLyrics(){
    lyricsState = "none"
    hideLyricsLoading()
    hideLyricsView()
    hideLyricOption()
}

function refreshAndDisplayLyrics(data){
  lyrics_code = data.lyrics_code
  tim = data.times_bank
  lyrics = data.lyrics_bank
  words = data.words_bank || []
  console.log("Refreshing Lyrics")
  initializeLyrics()
  // The animate loop in displayer.js will handle the lyric display.
  last_lyrics_refresh = data.song_identifier
}