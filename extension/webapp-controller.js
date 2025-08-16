document.getElementById("pauseplaybutton").onclick = pausePlay
document.getElementById("album-image").onclick = pausePlay
document.getElementById("backbutton").onclick = previous
document.getElementById("nextbutton").onclick = skip
document.getElementById("mic").onclick = toggleLyrics
document.getElementById("subtractOffset").onclick = subtractOffset
document.getElementById("addOffset").onclick = addOffset
document.getElementById("clock").onclick=showTimeAdjustment



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
    chrome.runtime.sendMessage({origin:"webapp", payload: 'ytm-pause', data: null })
    
}

function previous(){
    document.getElementById("lyric-holder").scrollTo(0, 0)
    chrome.runtime.sendMessage({ origin:"webapp", payload: 'ytm-back', data: null })
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

    chrome.runtime.sendMessage({ origin:"webapp", payload: 'ytm-next', data: null })
}


function requestSongDataUpdate(){
    chrome.runtime.sendMessage({ origin:"webapp", payload: 'ytm-requestUpdate', data: null })
}

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

function showSettings(){
    document.getElementById("settings-overall").style.opacity = "1"
    document.getElementById("settings-overall").style.pointerEvents = "all"
}

function hideSettings(){
    document.getElementById("settings-overall").style.opacity = "0"
    document.getElementById("settings-overall").style.pointerEvents = "none"
}


function showSharing(){
    document.getElementById("sharing-overall").style.opacity = "1"
    document.getElementById("sharing-overall").style.pointerEvents = "all"
}

function hideSharing(){
    document.getElementById("sharing-overall").style.opacity = "0"
    document.getElementById("sharing-overall").style.pointerEvents = "none"
}

document.getElementById("sharing-button-holder").onclick = showSharing;
document.getElementById("sharing-overall").onclick = hideSharing;
document.getElementById("sharing-panel").onclick = function(e){ e.stopPropagation(); } // prevent click from bubbling to hideSharing

function requestScanTo(timecode){
    let timeToScan = timecode - current_time;
    console.log("Requesting scan to timecode: ", timeToScan)

    chrome.runtime.sendMessage({ origin:"webapp", payload: 'ytm-scan-to', data: {time:timeToScan} })
}

var background_blur;
let bgblur = window.localStorage.getItem("blur")
if (bgblur == null || bgblur == undefined){
    background_blur = 0.15;
} else {
    background_blur = parseFloat(bgblur)
}

let doOptimization;
let optimizationSetting = window.localStorage.getItem("optimization")
if (optimizationSetting == null|| optimizationSetting == undefined || optimizationSetting == "true"){
        document.getElementById("settings-optimization").checked = true
        doOptimization = true;
} else {
        document.getElementById("settings-optimization").checked = false
        doOptimization = false;
}

let animationSeetting = window.localStorage.getItem("animation")
if (animationSeetting == null || animationSeetting == undefined || animationSeetting == "true"){
    console.log("Animations enabled")
    document.getElementById("settings-animation").checked = true
} else {
    console.log("Animations disabled")
    doAnimation = false;
    document.getElementById("settings-animation").checked = false
    document.getElementById("optimize-perf").style.opacity = "0.5";
    document.getElementById("optimize-perf").style.pointerEvents = "none";

}



function toggleAnimation(){
    if (document.getElementById("settings-animation").checked){
        doAnimation = true;
        window.localStorage.setItem("animation", "true")
        document.getElementById("optimize-perf").style.opacity = "1";
        document.getElementById("optimize-perf").style.pointerEvents = "all";
    } else {
        doAnimation = false;
        window.localStorage.setItem("animation", "false")
        document.getElementById("optimize-perf").style.opacity = "0.5";
        document.getElementById("optimize-perf").style.pointerEvents = "none";
    }
}

document.getElementById("settings-optimization").onclick = toggleOptimization;
function toggleOptimization(){
    if (document.getElementById("settings-optimization").checked){
        doAnimation = true;
        window.localStorage.setItem("optimization", "true")
        document.getElementById("optimize-perf").style.opacity = "1";
        document.getElementById("optimize-perf").style.pointerEvents = "all";
    } else {
        doAnimation = false;
        window.localStorage.setItem("optimization", "false")
        document.getElementById("optimize-perf").style.opacity = "0.5";
        document.getElementById("optimize-perf").style.pointerEvents = "none";
    }
}

document.getElementById("settings-animation").onclick = toggleAnimation

document.getElementById("main-body").style.backgroundColor = "rgba(0, 0, 0, "+background_blur+")"
document.getElementById("background-tint").value = background_blur
document.getElementById("background-tint").oninput = function(){
    background_blur = this.value
    document.getElementById("main-body").style.backgroundColor = "rgba(0, 0, 0, "+background_blur+")"
    window.localStorage.setItem("blur", background_blur)
    document.getElementById("reset-tint").style.opacity = "1"
    document.getElementById("reset-tint").style.pointerEvents = "all"
}
document.getElementById("reset-tint").onclick = function(){
    background_blur = 0.15
    document.getElementById("background-tint").value = background_blur
    document.getElementById("main-body").style.backgroundColor = "rgba(0, 0, 0, "+background_blur+")"
    this.style.opacity = "0"
    this.style.pointerEvents = "none"
    window.localStorage.setItem("blur", background_blur)
}
document.getElementById("settings-button-holder").onclick = showSettings;
document.getElementById("settings-overall").onclick = hideSettings;
document.getElementById("settings-panel").onclick = function(e){ e.stopPropagation(); } // prevent click from bubbling to hideSettings
document.getElementById("buymeacoffee").onclick = function(){
    window.open("https://buymeacoffee.com/nvemuri", "_blank").focus();
}
document.getElementById("feedback").onclick = function(){
    window.open("https://github.com/nwvbug/YouTubeMusic-Beautifier", "_blank").focus();
}

const progressBarContainer = document.getElementById('progressbarholder');

function handleProgressBarClick(event) {
    const rect = progressBarContainer.getBoundingClientRect();
    const clickX = event.clientX - rect.left; 
    const percentage = clickX / rect.width;

    getScanned(percentage); 
}

progressBarContainer.addEventListener('click', handleProgressBarClick);

function getScanned(percentage) {
    console.log('Clicked at percentage:', percentage);
    let timeToScan = Math.floor(percentage * totalDuration);
    requestScanTo(timeToScan);
}

function goFullScreen(){
    if (document.fullscreenElement == null){
        document.documentElement.requestFullscreen();
        document.getElementById("maximize").style.display = "none"
        document.getElementById("minimize").style.display = ""
    } else {
        document.exitFullscreen();
        document.getElementById("maximize").style.display = ""
        document.getElementById("minimize").style.display = "none"
    }
}
document.getElementById("fullscreen-button-holder").onclick = goFullScreen;


let escapePresses = 0;
let timer;

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    escapePresses++;
    if (escapePresses === 1) {
      timer = setTimeout(function() {
        escapePresses = 0;
      }, 5000);
    } else if (escapePresses === 2) {
      console.log('Double Escape Pressed!');
      performDoubleEscapeAction();
      clearTimeout(timer);
      escapePresses = 0;
    }
  }
});

function performDoubleEscapeAction() {
  document.getElementById("esc-notif").style.opacity = "1"
    document.getElementById("esc-notif").style.pointerEvents = "all"
  setTimeout(()=>{
    document.getElementById("esc-notif").style.opacity = "0"
    document.getElementById("esc-notif").style.pointerEvents = "none"
}, 3000) 
}

function showTimeAdjustment(){
    document.getElementById("time-popup").style.display = "flex"
    document.getElementById("clock").onclick=hideTimeAdjustment
}

function hideTimeAdjustment(){
    document.getElementById("time-popup").style.display = "none"
    document.getElementById("clock").onclick=showTimeAdjustment
}



