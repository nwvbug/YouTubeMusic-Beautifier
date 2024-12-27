document.getElementById("pauseplaybutton").onclick = pausePlay
document.getElementById("backbutton").onclick = previous
document.getElementById("nextbutton").onclick = skip

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
    lyrics = []
    chrome.runtime.sendMessage({ action: 'ytm-next', data: null })
}