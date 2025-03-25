var current_song;
var current_next;
var current_prev;
var debug_incr = 0;
var queue_cache;
var queue_hash;
var current_queue_index;
var compareAgainst = "data:image/gif;base64"
var incomingSecondOffset = 0;
var totalDuration

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'sendQueue-ytmlyrics'){
      // queue stuff coming soon (wip)
    }
    else if (request.action === 'displayData-ytmlyrics') {
      request.data.title = request.data.title.replaceAll("amp;", "");
      request.data.artist = request.data.artist.replaceAll("amp;", "");
      request.data.album = request.data.album.replaceAll("amp;", "");
      send_packet(request.data)
      // Use the received data
      updateTimestamp(request.data.elapsed, request.data.total)
      totalDuration = request.data.total;
      let temp_current_song = request.data.title+request.data.artist+request.data.album
      if (temp_current_song != current_song){
        hideLyricsView()
        loadLyricOption()
        hideBackground()
        setTimeout(() => {
          showBackground()
        }, 1000);
        document.getElementById("canvas-hider").style.opacity = "1"

        
        current_song = temp_current_song;
        resetOffset()
        document.getElementById("title").innerText = request.data.title;
        document.getElementById("artist-album").innerText = request.data.artist+" • "+request.data.album;
        if (request.data.large_image!= null){
          document.getElementById("album-image").src=request.data.large_image
          createAnimatedBackground(request.data.large_image)
        }
        document.title = request.data.title + " | YTM-B"
        console.log(request.data.elapsed, " | ", request.data.total, " | ", request.data.elapsed/request.data.total*100)
        getSongLyrics(request.data.title, request.data.artist, request.data.album)
        displayLyricOneAtATime(request.data.elapsed, debug_incr)
        
      } else {
        console.log(request.data.elapsed, " | ", request.data.total, " | ", request.data.elapsed/request.data.total*100)
        displayLyricOneAtATime(request.data.elapsed-incomingSecondOffset, debug_incr)
      }

      if (request.data.playPauseState != null){
        if (request.data.playPauseState == "Pause" && document.getElementById("pauseplaybutton").src != "assets/pause.png"){
          document.getElementById("pauseplaybutton").src = "assets/pause.png"
        } else if (request.data.playPauseState == "Play" && document.getElementById("pauseplaybutton").src != "assets/play.png"){
          document.getElementById("pauseplaybutton").src = "assets/play.png"
        }
      }

    }
  });

function getSongLyrics(title, artist, album){
  hideLyricsView()
  
  let url_addon = title+" "+artist
  url_addon = url_addon.replaceAll("/", "-")
  url_addon = url_addon.replaceAll("%", "%25")
  fetch(REST_URL+"/request-lyrics/"+url_addon).then(response => response.text()) // Change server in config.js
  .then(result => {
      // Handle the received text data
      console.log(result); 
      if (result == "no_lyrics_found"){
        console.log("no lyrics")
        lyric_source = "none"
        hideLyricOption()
      } else {
        result = JSON.parse(result)
        data = result["lrc"]
        console.log(data)
        if (result["source"] == "unofficial"){
          parseUnofficialLyrics(data)
        } else if (result["source"] == "ytm"){
          parseYTMLyrics(data)
          
        }
        
        if (currentlyShowingLyrics && lyrics.length == tim.length && lyrics.length > 0){
          showLyricsView()
          showLyricOption()
        } else if (!currentlyShowingLyrics){
          showLyricOption()
        } else {
          hideLyricOption()
        }
      }
      
  })
  .catch(error => {
      console.error('Error:', error);
  });
}

async function createSHA256Hash(inputString) {
  const encoder = new TextEncoder();
  const data = encoder.encode(inputString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
}

function updateQueue(incomingQueue){
  let incomingQueueString = ""
  for (let item of incomingQueue){
    incomingQueueString+=item.name+item.artist
  }
  if (queue_cache == undefined || queue_cache == null){
    queue_cache = incomingQueue
    return;
  }
  if (queue_hash == createSHA256Hash(incomingQueueString)){
    return;
  }
  for (let i = 0; i<incomingQueue.length; i++){
    if (incomingQueue[i].image.includes(compareAgainst)){ //BROKEN IMAGE LINK
      if (queue_cache[i].name + queue_cache[i].album == incomingQueue[i].name + incomingQueue[i].album){
        incomingQueue[i].image = queue_cache[i].image;
      } else { 
        incomingQueue[i].image = "https://media.istockphoto.com/id/1222357475/vector/image-preview-icon-picture-placeholder-for-website-or-ui-ux-design-vector-illustration.jpg?s=612x612&w=0&k=20&c=KuCo-dRBYV7nz2gbk4J9w1WtTAgpTdznHu55W9FjimE="
        for (let j = 0; j<queue_cache.length; j++){
          if (queue_cache[j].name + queue_cache[j].album == incomingQueue[i].name + incomingQueue[i].album){
            incomingQueue[i].image = queue_cache[i].image;
            break;
          }
        }
      }
    }
  }

  let parsedIQstring = ""
  for (let item of incomingQueue){
    parsedIQstring+=item.name+item.artist
  }
  queue_hash = createSHA256Hash(parsedIQstring)
  queue_cache = incomingQueue


}