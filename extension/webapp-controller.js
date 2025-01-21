document.getElementById("pauseplaybutton").onclick = pausePlay
document.getElementById("album-image").onclick = pausePlay
document.getElementById("backbutton").onclick = previous
document.getElementById("nextbutton").onclick = skip
document.getElementById("mic").onclick = toggleLyrics
document.getElementById("subtractOffset").onclick = subtractOffset
document.getElementById("addOffset").onclick = addOffset


var currentlyShowingLyrics = true;
var currentMainImage = "i1"
var currentPrevImage = "i0"
var currentNextImage = "i2"
function pausePlay(){
    // let album_img = document.getElementById("album-image")
    // album_img.style.boxShadow = "0px 0px 20px 10px rgba(255, 255, 255, 0.5)"
    // setTimeout(() => {
    //     album_img.style.boxShadow = "none"
    // }, (200));
    let button = document.getElementById("pauseplaybutton")
    if (button.getAttribute("data-paused") == "false"){
        button.src = "assets/play.png"
        button.setAttribute("data-paused", "true")
    } else {
        button.src = "assets/pause.png"
        button.setAttribute("data-paused", "false")
    }
    chrome.runtime.sendMessage({ action: 'ytm-pause', data: null })
    
}

function previous(){
    document.getElementById("lyric-holder").scrollTo(0, 0)
    chrome.runtime.sendMessage({ action: 'ytm-back', data: null })
}

function skip(){
    hideBackground()
    document.getElementById("lyric-holder").scrollTo(0, 0)
    document.getElementById("lyric-holder").innerHtml = ""
    hideLyricsView()
    // lyrics = []
    // if (currentMainImage == "i2"){
    //     currentMainImage = "i0"
    //     currentNextImage = "i1"
    //     currentPrevImage = "i2"
    // } else if (currentMainImage == "i1"){
    //     currentMainImage = "i2"
    //     currentNextImage = "i0"
    //     currentPrevImage = "i1"
    // } else if (currentMainImage == "i0"){
    //     currentMainImage = "i1"
    //     currentNextImage = "i2"
    //     currentPrevImage = "i0" 
    // }
    // document.getElementsByClassName("album main")[0].className = "album prev"
    // document.getElementsByClassName("album next")[0].className = "album main"
    // document.getElementsByClassName("album prev")[0].className = "album prev2"
    // setTimeout(function(){
    //     document.getElementsByClassName("album prev2")[0].style.display = "none"
    // }, 500)

    // setTimeout(function(){
    //     document.getElementsByClassName("album prev2")[0].style.display = ""
    //     document.getElementsByClassName("album prev2")[0].className = "album next2"

    //     setTimeout(function(){
    //         document.getElementsByClassName("album next2")[0].className = "album next"

    //     },500)
    // }, 1000)    

    chrome.runtime.sendMessage({ action: 'ytm-next', data: null })
}



function requestQueueUpdate(){
    chrome.runtime.sendMessage({ action: 'ytm-request-queue-update', data: null })
}
function requestSongDataUpdate(){
    chrome.runtime.sendMessage({ action: 'ytm-request-song-data-update', data: null })
}
requestQueueUpdate();
requestSongDataUpdate();

function toggleLyrics(){
    if (currentlyShowingLyrics){
        hideLyricsView()
    } else {
        showLyricsView()
    }
    currentlyShowingLyrics = !currentlyShowingLyrics
}

function subtractOffset(){
    incomingSecondOffset++;
    document.getElementById("offset").innerText = -1 * incomingSecondOffset
    saveOffset()
}

function addOffset(){
    incomingSecondOffset--;
    document.getElementById("offset").innerText = -1 * incomingSecondOffset
    saveOffset()
}   

function resetOffset(){
    chrome.storage.sync.get(current_song, (result) => {
        if (result != undefined && result[current_song] != undefined){
            incomingSecondOffset = result[current_song]
            document.getElementById("offset").innerText = -1 * result[current_song]
        } else {
            incomingSecondOffset = 0
            document.getElementById("offset").innerText = 0
        }
      });
    
}

function saveOffset(){
    chrome.storage.sync.set({ [current_song]: incomingSecondOffset }, () => {
        console.log(`Saved ${incomingSecondOffset} under key ${current_song}`);
      });
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