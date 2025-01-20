var current_song;
var current_next;
var current_prev;
var debug_incr = 0;
var queue_cache;
var queue_hash;
var current_queue_index;
var compareAgainst = "data:image/gif;base64"
var incomingSecondOffset = 0;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'sendQueue-ytmlyrics'){
      // let next = request.data.next
      // let previous = request.data.previous
      // console.log("QUEUE ALERT")
      // console.log(request.data)
      // current_queue_index = request.data.position_in_queue
      // updateQueue(request.data.queue_data)

      // if (next != null && current_next != next.name+next.artist+next.image){
      //   current_next = next.name+next.artist+next.image
      //   document.getElementById(currentNextImage).style.opacity = "1";
      //   document.getElementById(currentNextImage).style.pointerEvents = "all";
      //   next.name = next.name.replaceAll("amp;", "");
      //   next.artist = next.artist.replaceAll("amp;", "");
      //   //document.getElementById("next-title").innerText = next.name;
      //   //document.getElementById("next-artist").innerText = next.artist;
      //   document.getElementById(currentNextImage).src = queue_cache[current_queue_index+1].image;
      // }
      // if (next == null){
      //   document.getElementById(currentNextImage).style.opacity = "0";
      //   document.getElementById(currentNextImage).style.pointerEvents = "none";
      // }

      // if (previous != null && current_prev != previous.name+previous.artist+previous.image){
      //   current_prev = previous.name+previous.artist+previous.image
      //   document.getElementById(currentPrevImage).style.opacity = "1";
      //   document.getElementById(currentPrevImage).style.pointerEvents = "all";
      //   previous.name = previous.name.replaceAll("amp;", "");
      //   previous.artist = previous.artist.replaceAll("amp;", "");
      //   //document.getElementById("previous-title").innerText = previous.name;
      //   //document.getElementById("previous-artist").innerText = previous.artist;
      //   document.getElementById(currentPrevImage).src = queue_cache[current_queue_index-1].image;
      // }
      // if (previous == null){
      //   document.getElementById(currentPrevImage).style.opacity = "0";
      //   document.getElementById(currentPrevImage).style.pointerEvents = "none";
      // }  
      
      
    }
    else if (request.action === 'displayData-ytmlyrics') {
      request.data.title = request.data.title.replaceAll("amp;", "");
      request.data.artist = request.data.artist.replaceAll("amp;", "");
      request.data.album = request.data.album.replaceAll("amp;", "");
      console.log(request.data.playPauseState)

      // Use the received data
      //console.log(request.data); 
      updateTimestamp(request.data.elapsed, request.data.total)
      let temp_current_song = request.data.title+request.data.artist+request.data.album
      console.log("Request #: "+(++debug_incr))
      if (temp_current_song != current_song){
        hideLyricsView()
        loadLyricOption()
        console.log("New song!")
        hideBackground()
        setTimeout(() => {
          console.warn("SHOWING BACKGROUND")
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
        document.title = request.data.title + " | BYTM"
        console.log(request.data.elapsed, " | ", request.data.total, " | ", request.data.elapsed/request.data.total*100)
        getSongLyrics(request.data.title, request.data.artist, request.data.album)
        displayLyricOneAtATime(request.data.elapsed, debug_incr)
        
      } else {
        console.log(request.data.elapsed, " | ", request.data.total, " | ", request.data.elapsed/request.data.total*100)
        console.log("Still playing current song")
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
  let url_addon = title+" [By] "+artist
  fetch("http://127.0.0.1:7070/request-lyrics/"+url_addon).then(response => response.text()) // Get the text content
  .then(data => {
      // Handle the received text data
      console.log(data); 
      if (data == "no_lyrics_found"){
        console.log("no lyrics")
      } else {
        processData(data)
        initializeLyrics()
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
  console.log("Comparing Queues")
  let incomingQueueString = ""
  for (let item of incomingQueue){
    incomingQueueString+=item.name+item.artist
  }
  if (queue_cache == undefined || queue_cache == null){
    console.log("QC is empty, pushing IQ")
    queue_cache = incomingQueue
    return;
  }
  if (queue_hash == createSHA256Hash(incomingQueueString)){
    console.log("Identical, returning")
    return;
  }
  for (let i = 0; i<incomingQueue.length; i++){
    if (incomingQueue[i].image.includes(compareAgainst)){ //BROKEN IMAGE LINK
      if (queue_cache[i].name + queue_cache[i].album == incomingQueue[i].name + incomingQueue[i].album){
        //trying to resolve in o(1) if possible
        console.log("Resetting IQ image to QC Image [O(1)]")
        incomingQueue[i].image = queue_cache[i].image;
      } else { //fine we will loop
        incomingQueue[i].image = "https://media.istockphoto.com/id/1222357475/vector/image-preview-icon-picture-placeholder-for-website-or-ui-ux-design-vector-illustration.jpg?s=612x612&w=0&k=20&c=KuCo-dRBYV7nz2gbk4J9w1WtTAgpTdznHu55W9FjimE="
        for (let j = 0; j<queue_cache.length; j++){
          if (queue_cache[j].name + queue_cache[j].album == incomingQueue[i].name + incomingQueue[i].album){
            incomingQueue[i].image = queue_cache[i].image;
            console.log("Resetting IQ image to QC Image [O(n)]")
            break;
          }
        }
      }
    }
    //somehow merge the 2 queues keeping the ordering of the new one but the data of the old one if better
  }

  let parsedIQstring = ""
  for (let item of incomingQueue){
    parsedIQstring+=item.name+item.artist
  }
  queue_hash = createSHA256Hash(parsedIQstring)
  queue_cache = incomingQueue
  console.warn("Queue Updated")


}