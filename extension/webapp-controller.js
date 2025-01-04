document.getElementById("pauseplaybutton").onclick = pausePlay
document.getElementById("backbutton").onclick = previous
document.getElementById("nextbutton").onclick = skip
var currentMainImage = "i1"
var currentPrevImage = "i0"
var currentNextImage = "i2"
function pausePlay(){
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
    document.getElementById("lyric-holder").scrollTo(0, 0)
    document.getElementById("lyric-holder").innerHtml = ""
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
    document.getElementById("i0").src = document.getElementById("i1").src
    document.getElementById("i1").src = document.getElementById("i2").src //NEED LOADING ICON TO GO ON TOP OF THIS UNTIL THE HIGH RES ALBUM ART GETS HERE
    try {
        document.getElementById("i2").src = queue_cache[current_queue_index+1].image

    } catch {
        console.log("need queue update i suppose")
    }

    chrome.runtime.sendMessage({ action: 'ytm-next', data: null })
}

function hideLyrics(){
    document.getElementById("lyrics-flex").style.display = "none"
    
}

function requestQueueUpdate(){
    chrome.runtime.sendMessage({ action: 'ytm-request-queue-update', data: null })
}
function requestSongDataUpdate(){
    chrome.runtime.sendMessage({ action: 'ytm-request-song-data-update', data: null })
}
requestQueueUpdate();
requestSongDataUpdate();