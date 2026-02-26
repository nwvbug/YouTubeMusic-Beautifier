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

var isExtension = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);

if (isExtension) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.origin != "middleman"){
      return
    }
    chrome.runtime.sendMessage({origin:"webapp", payload:"acknowledge"})
    if (request.action == "sendParsedData"){
      onUpdate(request.payload)
    } else if (request.action == "client_disconnected"){
      clientDisconnected(request.payload)
    } else if (request.action == "room_created"){
      generateQrCode(request.payload)
    } else if (request.action == "client_joined"){
      clientJoined(request.payload)
    } else if (request.action == "tab-focused"){
      doAnimation = false
    } else if (request.action == "tab-unfocused"){
      doAnimation = true
    }
  })
}

function onUpdate(data){
    updateTimestamp(data.elapsed_time, data.total_time)
    if (current_song == data.song_identifier){
        displayLyricOneAtATime(data.elapsed_time)

    } else { //new song
        //console.log("New Song: "+data.song_identifier)
        rerolled = false;
        loadLyricOption()
        current_song = data.song_identifier
        totalDuration = data.total_time
        tim = []
        lyrics = []
        last_lyrics_refresh = ""
        current_time = -1
        current_index = 0
        document.getElementById("lyric-holder").innerHTML = ""
        hideLyricsView()
        if (started) {
            hideBackground()
        }
        setTimeout(() => {
           showBackground()
          if (currentlyShowingLyrics && data.lyrics_freshness){
            showLyricsView()
          }
        }, started ? 1000 : 50);
        document.getElementById("title").innerText = data.song_name;
        if (data.song_album.length > 40){
            document.getElementById("artist-album").innerText = data.song_artist + " • " + data.song_album.substring(0,27)+"..."
        } else {
            document.getElementById("artist-album").innerText = data.song_artist + " • " + data.song_album

        }
        document.getElementById("album-image").src = data.album_art;
        //console.log("Creating background with URL:", data.album_art)
        createAnimatedBackground(data.album_art)
        document.title = data.song_name + " - " + data.song_artist
        updateFavicon(data.album_art)

        if (displayedOffset != data["offset-for-display"]){
            displayedOffset = data["offset-for-display"]
            document.getElementById("offset").innerText = displayedOffset
        }
    }
    if (data.lyric_freshness == false){
        hideLyricsView()
        if (data.searched_for_lyrics){
          hideLyricOption()
        }
    } else {
        if (data.song_identifier != last_lyrics_refresh || data.lyrics_code != lyrics_code){
            refreshAndDisplayLyrics(data)
            incomingSecondOffset = data["offset-for-display"]
            document.getElementById("offset").innerText = -1 * incomingSecondOffset
        }

    }

    if (data.pause_state == "Pause" && !document.getElementById("pauseplaybutton").src.endsWith("/assets/pause.png")){
        document.getElementById("pauseplaybutton").src = "/assets/pause.png"
    } else if (data.pause_state == "Play" && !document.getElementById("pauseplaybutton").src.endsWith("/assets/play.png")){
        document.getElementById("pauseplaybutton").src = "/assets/play.png"
    }

    if ((data.live) && (!live)){
      live = true
      document.getElementById("shareinfo").style.display = ""
      generateQrCode(data.room_code)
    }
   if (!started){
      started = true
      // Delay loader removal so background images have time to load and render
      setTimeout(() => {
          document.getElementById("loader").style.transition = "opacity 0.5s"
          document.getElementById("loader").style.opacity = "0"
          setTimeout(() => {
              document.getElementById("loader").style.display = "none"
          }, 500)
      }, 1000)
   }
}

function refreshAndDisplayLyrics(data){
  lyrics_code = data.lyrics_code
  showLyricOption()
  tim = data.times_bank
  lyrics = data.lyrics_bank
  showLyricsView()
  lyrics = data.lyrics_bank
  tim = data.times_bank
  initializeLyrics()
  displayLyricOneAtATime(data.elapsed_time)
  last_lyrics_refresh = data.song_identifier
}

function updateFavicon(imageUrl) {
  if (!imageUrl) return;
  var favicon = document.getElementById('dynamic-favicon');
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.id = 'dynamic-favicon';
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }
  var img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function () {
    var c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    var cx = c.getContext('2d');
    var r = 10;
    cx.beginPath();
    cx.moveTo(r, 0);
    cx.lineTo(64 - r, 0);
    cx.quadraticCurveTo(64, 0, 64, r);
    cx.lineTo(64, 64 - r);
    cx.quadraticCurveTo(64, 64, 64 - r, 64);
    cx.lineTo(r, 64);
    cx.quadraticCurveTo(0, 64, 0, 64 - r);
    cx.lineTo(0, r);
    cx.quadraticCurveTo(0, 0, r, 0);
    cx.closePath();
    cx.clip();
    cx.drawImage(img, 0, 0, 64, 64);
    favicon.href = c.toDataURL('image/png');
  };
  img.src = imageUrl;
}