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
var started = false
var displayedOffset = 0

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  chrome.runtime.sendMessage({ type: "WEBAPP_ACKNOWLEDGE" });
  console.log("Message Recieved. Type: "+request.type+" Payload:")
  console.log(request.payload)

  switch (request.type) {
    case "STATE_UPDATE":
      onUpdate(request.payload)
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
        loadLyricOption()
        current_song = data.song_identifier
        totalDuration = data.total_time
        hideBackground()
        setTimeout(() => {
           showBackground()
           isTransitioning = false
          if (userPrefersLyricsVisible && data.lyric_freshness){
            showLyricsView()
            if (data.song_identifier != last_lyrics_refresh || data.lyrics_code != lyrics_code){
                refreshAndDisplayLyrics(data)
                incomingSecondOffset = data["offset-for-display"]
                document.getElementById("offset").innerText = -1 * incomingSecondOffset
            }
          } else {
            hideLyricsView()
          }
        }, 1000);
        console.log("song id: "+data.song_identifier)
        document.getElementById("title").innerText = data.song_name;
        if (data.song_album.length > 40){
            document.getElementById("artist-album").innerText = data.song_artist + " • " + data.song_album.substring(0,27)+"..."
        } else {
            document.getElementById("artist-album").innerText = data.song_artist + " • " + data.song_album

        }
        document.getElementById("album-image").src = data.album_art;
        createAnimatedBackground(data.album_art)
        document.title = data.song_name + " | YTM-B"

        if (displayedOffset != data["offset-for-display"]){
            displayedOffset = data["offset-for-display"]
            document.getElementById("offset").innerText = displayedOffset
        }
    }

    console.log("Lyrics Freshness: "+data.lyric_freshness)
    if (data.lyric_freshness == false){
        hideLyricsView()
        console.log("Not Fresh Lyrics")
        if (data.searched_for_lyrics){
          console.log("no lyrics found")
          hideLyricOption()
        }
    } else {
        if(userPrefersLyricsVisible && !isTransitioning) {
            showLyricsView();
        }
        if (!isNewSong){
            if (data.song_identifier != last_lyrics_refresh || data.lyrics_code != lyrics_code){
                refreshAndDisplayLyrics(data)
                incomingSecondOffset = data["offset-for-display"]
                document.getElementById("offset").innerText = -1 * incomingSecondOffset
            }
        }
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

function refreshAndDisplayLyrics(data){
  lyrics_code = data.lyrics_code
  showLyricOption()
  tim = data.times_bank
  lyrics = data.lyrics_bank
  console.log("Refreshing Lyrics")
  lyrics = data.lyrics_bank
  tim = data.times_bank
  initializeLyrics()
  // setTimeout(()=>{
  //     console.log("SCROLLING TO LYRICS 2")
  //     document.getElementById("0").scrollIntoView(scrollIntoViewOptions={"block":"center", "behavior":"smooth"})
  // }, 250)
  // The animate loop in displayer.js will handle the lyric display.
  last_lyrics_refresh = data.song_identifier
}