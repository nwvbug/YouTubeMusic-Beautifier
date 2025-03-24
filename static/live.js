// REQUIRES     <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.js" integrity="sha512-q/dWJ3kcmjBLU4Qc47E4A9kTB4m3wuTY7vkFJDTZKjTs8jhyGQnaUrxa0Ytd0ssMZhbNua9hE+E7Qv1j+DyZwA==" crossorigin="anonymous"></script>
var current_song;
var currentlyShowingLyrics = true;
function getSession() {
    if (window.localStorage.getItem("session") == null){
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('session');
    } else {
        return window.localStorage.getItem("session")
    }
    
  }
  
const sessionID = getSession();
hideBackground()
hideUI()
if (sessionID) {
console.log("Session ID:", sessionID);
window.localStorage.setItem("session", sessionID)
} else {
console.log("No session ID found.");
document.getElementById("sign-in").style.opacity = 1;
document.getElementById("sign-in").style.opacity = "all";
}

const socket = io("http://localhost:7070", {
    auth: {
        role:"listenener",
        session:window.localStorage.getItem("session")
    }
});

window.addEventListener("beforeunload", () =>{
    socket.emit("disconnect")
})


function send_packet(data){
    socket.emit("update", {"intents":"update", "data":data, "session":window.localStorage.getItem("session")})
}

socket.on("identification", function(data){
    console.log("Server response", data)
})

socket.on("left", function(data){
    console.log("device left. role ", data["role"])
})

socket.on("takeover", function(data){
    console.log("Another device logged into your account has taken over hosting")
})

socket.on("update", function(data){
    console.log("Host said ", data)
    showUI()
    hideHostWaiting()
    updateTimestamp(data.elapsed, data.total)
    document.getElementById("nameofdevice").innerText = data.uname+"'s "+data.hostidentifier+" device"
    let temp_current_song = data.title+data.artist+data.album
      if (temp_current_song != current_song){
        hideLiveLyricsView()
        loadLyricOption()
        hideBackground()
        setTimeout(() => {
          showBackground()
        }, 1000);
        document.getElementById("canvas-hider").style.opacity = "1"

        
        current_song = temp_current_song;
        document.getElementById("title").innerText = data.title;
        document.getElementById("artist-album").innerText = data.artist+" • "+data.album;
        if (data.large_image!= null){
          document.getElementById("album-image").src=data.large_image
          createAnimatedBackground(data.large_image)
        }
        document.title = data.title + " | YTM-B Live"
        console.log(data.elapsed, " | ", data.total, " | ", data.elapsed/data.total*100)
        getSongLyrics(data.title, data.artist, data.album)
        displayLyricOneAtATime(data.elapsed)
        
      } else {
        console.log(data.elapsed, " | ", data.total, " | ", data.elapsed/data.total*100)
        displayLyricOneAtATime(data.elapsed)
      }

      if (data.playPauseState != null){
        if (data.playPauseState == "Pause" && document.getElementById("pauseplaybutton").src != "assets/pause.png"){
          document.getElementById("pauseplaybutton").src = "assets/pause.png"
        } else if (data.playPauseState == "Play" && document.getElementById("pauseplaybutton").src != "assets/play.png"){
          document.getElementById("pauseplaybutton").src = "assets/play.png"
        }
      }
})

function hideUI(){
    document.getElementById("main-body").style.opacity = "0"
    document.getElementById("main-body").style.pointerEvents = "none"
}

function showUI(){
    document.getElementById("main-body").style.opacity = "1"
    document.getElementById("main-body").style.pointerEvents = "all"
}

function hideLyricOption(){
    document.getElementById("mic").style.pointerEvents = "none"
    document.getElementById("mic").style.animation = ""
    document.getElementById("mic").style.opacity = "0.15"
}

function showLyricOption(){
    document.getElementById("mic").style.pointerEvents = "all"
    document.getElementById("mic").style.animation = ""
    document.getElementById("mic").style.opacity = "1"
}

function loadLyricOption(){
    document.getElementById("mic").style.animation = "1.5s ease-in-out loadingMic infinite"
    document.getElementById("mic").style.pointerEvents = "none"
}

function showSettings(){
    document.getElementById("settings-overall").style.opacity = "1"
    document.getElementById("settings-overall").style.pointerEvents = "all"
}

function hideSettings(){
    document.getElementById("settings-overall").style.opacity = "0"
    document.getElementById("settings-overall").style.pointerEvents = "none"
}

function hideHostWaiting(){
    document.getElementById("waiting-for-host").style.opacity = "0"
    document.getElementById("waiting-for-host").style.pointerEvents = "none"
}

function showHostWaiting(){
    document.getElementById("waiting-for-host").style.opacity = "1"
    document.getElementById("waiting-for-host").style.pointerEvents = "all"
}


function toggleLyrics(){
    if (currentlyShowingLyrics){
        hideLiveLyricsView()
    } else {
        showLiveLyricsView()
    }
    currentlyShowingLyrics = !currentlyShowingLyrics
}

function getSongLyrics(title, artist, album){
    hideLiveLyricsView()
    
    let url_addon = title+" [By] "+artist
    url_addon = url_addon.replaceAll("/", "-")
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
            showLiveLyricsView()
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
  

  function hideLiveLyricsView(){
    document.getElementById("lyrics-flex").style.maxWidth = "0vw"
    document.getElementById("lyrics-flex").style.opacity = "0"

    document.getElementById("main-body").style.gap = "0"
}

function showLiveLyricsView(){
    document.getElementById("lyrics-flex").style.maxWidth = "50vw"
    document.getElementById("lyrics-flex").style.opacity = "1"
    document.getElementById("main-body").style.gap = "100px"
    
}

function previous(){

}

function next(){

}

function pauseplay(){
    console.log("PAUSEPLAY")
    let button = document.getElementById("pauseplaybutton")
    if (button.getAttribute("data-paused") == "false"){
        button.src = "assets/play.png"
        button.setAttribute("data-paused", "true")
    } else {
        button.src = "assets/pause.png"
        mode = "play"
        button.setAttribute("data-paused", "false")
    }
    send_packet({"intents":"pauseplay"})
}