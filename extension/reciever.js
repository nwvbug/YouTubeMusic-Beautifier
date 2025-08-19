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

var lyrics_fresh = false;
var tim = []
var lyrics = []

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.origin != "middleman"){
    return
  }
  chrome.runtime.sendMessage({origin:"webapp", payload:"acknowledge"})
  console.log("Message Recieved. Action: "+request.action+" Payload:")
  console.log(request.payload)
  if (request.action == "sendParsedData"){
    onUpdate(request.payload)
  } else if (request.action == "client_disconnected"){
    clientDisconnected(request.payload)
  } else if (request.action == "room_created"){
    generateQrCode(request.payload)
  } else if (request.action == "client_joined"){
    clientJoined(request.payload)
  }
  
})

function onUpdate(data){
    console.log("ONUpdate")
    updateTimestamp(data.elapsed_time, data.total_time)
    if (current_song == data.song_identifier){
        displayLyricOneAtATime(data.elapsed_time)
        
    } else { //new song
        console.log("New Song")
        loadLyricOption()
        current_song = data.song_identifier
        hideLyricsView()
        hideBackground()
        setTimeout(() => {
           showBackground()
          if (currentlyShowingLyrics && data.lyrics_freshness){
            showLyricsView()
            console.log("SCROLLING TO LYRICS 1")
            document.getElementById("0").scrollIntoView(scrollIntoViewOptions={"block":"center", "behavior":"smooth"})
            
          }
        }, 1000);
        console.log("song id: "+data.song_identifier)
        document.getElementById("title").innerText = data.song_name;
        document.getElementById("artist-album").innerText = data.song_artist + " • " + data.song_album
        document.getElementById("album-image").src = data.album_art;
        createAnimatedBackground(data.album_art)
        document.title = data.song_name + " | Live via YTM-B"
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
        if (data.song_identifier != last_lyrics_refresh){
            showLyricOption()
            tim = data.times_bank
            lyrics = data.lyrics_bank
            console.log("Refreshing Lyrics")
            showLyricsView()
            lyrics = data.lyrics_bank
            tim = data.times_bank
            initializeLyrics()
            setTimeout(()=>{
                console.log("SCROLLING TO LYRICS 2")
                document.getElementById("0").scrollIntoView(scrollIntoViewOptions={"block":"center", "behavior":"smooth"})
            }, 250)
            displayLyricOneAtATime(data.elapsed_time)
            last_lyrics_refresh = data.song_identifier
        }
        
    }

    if (data.pause_state == true && document.getElementById("play-pause").src !="/assets/pause.png"){
        console.log("Playing")
        document.getElementById("play-pause").src = "/assets/pause.png"
    } else if (data.pause_state == false && document.getElementById("play-pause").src != "/assets/play.png"){
        console.log("Paused")
        document.getElementById("play-pause").src = "/assets/play.png"
    }

   
}

