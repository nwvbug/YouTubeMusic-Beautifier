current_time = -1;
current_index = 0
var current_active_line = -1;
var doAnimation = true;

let syncedTime = 0;
let syncTimestamp = 0;
let isPlaying = false;
let songTotalTime = 0;

function updateSyncState(payload) {
    syncedTime = payload.currentTime;
    syncTimestamp = payload.syncTimestamp;
    isPlaying = payload.isPlaying;
    songTotalTime = payload.total_time;

    // Perform an initial update, so the UI doesn't wait for the next animation frame, especially if paused.
    if (!isPlaying) {
        const t = syncedTime - incomingSecondOffset;
        displayLyricOneAtATime(t);
        if (current_active_line >= 0) highlightWords(current_active_line, t);
        updateTimestamp(syncedTime, songTotalTime);
    }
}

function initializeLyrics(){
    console.log("INIT LYRICS")
    document.getElementById("lyric-holder").innerHTML = ""

    let totalhtml = ""
    for (let i = 0; i<20; i++){ //invis elements to push down first lines to center
        totalhtml += `<div></div>`
    }
    for (let i = 0; i<lyrics.length; i++){
        let useWords = true;
        if (typeof preferWordLevelLyrics !== 'undefined' && !preferWordLevelLyrics) {
            useWords = false;
        }
        if (useWords && words && words[i] && words[i].length > 0){
            let spans = words[i].map((w, j) =>
                `<span id="w-${i}-${j}" class="lyric-word">${w.word} </span>`
            ).join('')
            totalhtml += `<div id=${i} style="cursor:pointer;">${spans}</div>`
        } else {
            totalhtml += `<div id=${i} style="cursor:pointer;">${lyrics[i]}</div>`
        }
    }
    for (let i = 0; i<20; i++){ //invis elements to push up last lines to center
        totalhtml += `<div></div>`
    }
    document.getElementById("lyric-holder").innerHTML=totalhtml;
    document.getElementById("lyric-holder").scrollTop = 0;

    for (let item of document.getElementById("lyric-holder").children){
        if (item.id != null && item.id != undefined){
            try {
                item.onclick = function(){selectNewLyric(parseInt(item.id))}
            } catch {

            }
        }
    }

    current_index = 0;
    current_time = -1;
    current_active_line = -1;
}

function selectNewLyric(i){
    console.log("attempting to select lyric "+i)
    requestScanTo(tim[i])
}

function displayLyricOneAtATime(seconds, identifier=null){
    //console.log("displaying lyric at time: "+seconds)
    if (seconds < current_time){
        //document.getElementById("lyric-holder").scrollTo(0,0)
        let lyric_list = document.getElementById("lyric-holder").children
        for (let item of lyric_list){
            if (item.id != null && item.id != undefined){
                try {
                    resetLyric(item.id)
                } catch {

                }
                
            }
            
        }
        current_index = 0;
        for (let i = 0; i<tim.length; i++){
            if (seconds >= tim[i]){
                current_index = i;
                highlightLyric(current_index)
                break;
            }
        }
    }
    current_time = seconds;
    
    if (seconds >= tim[current_index]){
        highlightLyric(current_index)
        if (current_index-1 >= 0){
            resetLyric(current_index-1)
        }
        current_index++;

        if (seconds >= tim[current_index]){
            while(seconds >= tim[current_index]){
                if (current_index > 0){
                    resetLyric(current_index-1)
                } 
                current_index++;
            }
            highlightLyric(current_index-1)
            
        }
    } else {

    }
}


const canvas = document.getElementById("backgroundCanvas")
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// Also log the viewport size to compare
const ctx = canvas.getContext("2d")
var images = []
var staticImages = []
const speedsX = [-0.15, 0.17, -0.1, 0.12, -0.15, -0.1, -0.12, -0.15, -0.17, -0.2, 0.1, 0.12, 0.15, 0.17, 0.2]
const speedsY = [-0.15, 0.17, -0.1, 0.12, -0.15, 0.1, -0.12, 0.2, -0.17, 0.2, -0.15, 0.17, -0.1, 0.12, -0.15,]

const rotationSpeeds = [0.0001, -0.0002, 0.0003, -0.0004, 0.0005, -0.0001, 0.0002, -0.0003, 0.0004, -0.0005, -0.0003, 0.0004, -0.0005, 0.0003, -0.0004]




function createAnimatedBackground(imageUrl){
    images = []
    for (let i = 0; i<20; i++){
        images.push(new BackgroundMovingImage(imageUrl, Math.floor(Math.random() * canvas.width) + canvas.width/1.5, Math.floor(Math.random() * canvas.height) + canvas.height/1.5, defaultWarp, speedsX[i], speedsY[i], rotationSpeeds[i]))
    }
    setTimeout(() => {    drawInitialFrame()
    }, 1000);
}

function drawInitialFrame(){
    console.log("draw initiated")
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    images.forEach(image => {
        
        image.updatePosition()
        image.draw()
    })
}

function animate(){
    if (doAnimation){
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        images.forEach(image => {
            image.updatePosition()
            image.draw()
        })
    }

    if (isPlaying) {
        const elapsedSinceSync = (Date.now() - syncTimestamp) / 1000.0;
        const currentEstimatedTime = syncedTime + elapsedSinceSync;
        const finalTime = Math.min(currentEstimatedTime, songTotalTime);
        const adjustedTime = finalTime - incomingSecondOffset;

        displayLyricOneAtATime(adjustedTime);
        if (current_active_line >= 0) highlightWords(current_active_line, adjustedTime);
        updateTimestamp(finalTime, songTotalTime);
    }

    requestAnimationFrame(animate)
}
animate()


function updateTimestamp(elapsed, total){
    document.getElementById("progressbar").style.width = ((elapsed / total)  *100)+"%";
    document.getElementById("progressbar-portrait").style.width = ((elapsed / total)  *100)+"%";
}

function highlightLyric(lyric_id){
    current_active_line = lyric_id;
    if (window.innerWidth > 1300){
        document.getElementById(lyric_id).style.width = "100%"
        document.getElementById(lyric_id).style.fontSize = "40px"
    }
    else {
        document.getElementById(lyric_id).style.scale = "1.2"
    }

    document.getElementById(lyric_id).style.opacity = 1
    document.getElementById(lyric_id).style.fontWeight = 800;
    document.getElementById(lyric_id).scrollIntoView(scrollIntoViewOptions={"block":"center", "behavior":"smooth", "container":"nearest"})
}

function resetLyric(lyric_id){
    if (current_active_line === lyric_id) current_active_line = -1;

    document.getElementById(lyric_id).style.width = "80%"
    document.getElementById(lyric_id).style.fontSize = "32px"
    document.getElementById(lyric_id).style.scale = "1"
    document.getElementById(lyric_id).style.opacity = 0.4;
    document.getElementById(lyric_id).style.fontWeight = 500;

    // Clear word span styles so they inherit the dimmed parent opacity
    if (words && words[lyric_id]) {
        words[lyric_id].forEach((w, j) => {
            const span = document.getElementById(`w-${lyric_id}-${j}`);
            if (span) {
                span.classList.remove('active');
                span.style.opacity = '';
            }
        });
    }
}

function highlightWords(lineIndex, seconds){
    if (!words || !words[lineIndex]) return;
    const lineWords = words[lineIndex];
    lineWords.forEach((w, j) => {
        const span = document.getElementById(`w-${lineIndex}-${j}`);
        if (!span) return;
        if (seconds < w.time){
            span.classList.remove('active');
            span.style.opacity = '0.3';
        } else {
            let nextTime = w.time + 2.0; // Default max duration for the last word
            if (j + 1 < lineWords.length) {
                nextTime = lineWords[j + 1].time;
            } else if (lineIndex + 1 < tim.length) {
                nextTime = Math.min(w.time + 2.0, tim[lineIndex + 1]);
            }
            const duration = nextTime - w.time;
            let progress = duration > 0 ? Math.min(100, ((seconds - w.time) / duration) * 100) : 100;
            
            if (typeof useGradientHighlight !== 'undefined' && !useGradientHighlight) {
                progress = 100;
            }

            span.style.opacity = '1';
            if (progress >= 100){
                span.classList.remove('active');
            } else {
                span.classList.add('active');
                span.style.setProperty('--progress', `${progress}%`);
            }
        }
    });
}
let lyricsViewTimeout;

// "loading": search in flight, pane shows the pulsing logo
// "available": lyrics found, pane shows them (if the user wants)
// "none": no lyrics for this song, pane stays hidden
var lyricsState = "loading";

function showLyricsLoading(){
    lyricsState = "loading";
    document.getElementById("lyric-holder").style.display = "none";
    document.getElementById("lyrics-loader").style.display = "flex";
    if (userPrefersLyricsVisible){
        showLyricsView()
    }
}

function hideLyricsLoading(){
    document.getElementById("lyrics-loader").style.display = "none";
    document.getElementById("lyric-holder").style.display = "";
}

function hideLyricsView(){
    if (window.innerWidth > 1300){
        document.getElementById("lyric-holder").style.maxWidth = "0vw"
        document.getElementById("lyrics-flex").style.opacity = "0"
        document.getElementById("lyrics-flex").style.flex = "0"
        document.getElementById("info-panel").classList.toggle("closed", true)
        document.getElementById("main-body").style.gap = "0"
        
        // Reset portrait styles
        document.getElementById("lyric-holder").style.maxHeight = ""
    } else {
        document.getElementById("lyric-holder").style.maxHeight = "0vh"
        document.getElementById("info-panel").style.flex = "1"
        document.getElementById("info-panel").style.display = "flex"
        document.getElementById("info-panel").style.marginTop = "0"
        document.getElementById("info-panel").style.bottom = "0"
        document.getElementById("info-panel").style.top = "0"
        document.getElementById("info-panel-contents").style.flexDirection="column";
        
        // Reset landscape styles
        document.getElementById("lyric-holder").style.maxWidth = "100vw"
        document.getElementById("lyrics-flex").style.opacity = "0"
        document.getElementById("main-body").style.gap = "0"
    }
    return
}

window.onresize = function(event) {
    if (window.innerWidth > 1300){
        document.getElementById("info-panel-contents").style.flexDirection="column";
    } if (window.innerWidth <= 1300){
        document.getElementById("lyric-holder").style.maxWidth = "100vw"
    }
    hideLyricsView()

    // Only show the pane again if the user wants it and there is something to show
    // (either the loading indicator or actual lyrics)
    if (userPrefersLyricsVisible && (lyricsState === "loading" || (lyricsState === "available" && lyrics && lyrics.length > 0))) {
        showLyricsView()
    }
}

function showLyricsView(){
    if (lyricsViewTimeout) {
        clearTimeout(lyricsViewTimeout);
    }
    if (window.innerWidth > 1300){
        lyricsViewTimeout = setTimeout(() => {
            document.getElementById("lyric-holder").style.maxWidth = "50vw"
        }, 250);
        document.getElementById("lyrics-flex").style.opacity = "1"
        document.getElementById("main-body").style.gap = "10vw"
        document.getElementById("lyrics-flex").style.flex = "1"
        document.getElementById("info-panel").classList.toggle("closed", false)
        document.getElementById("info-panel-contents").style.flexDirection="column";
        
        // Reset portrait styles
        document.getElementById("lyric-holder").style.maxHeight = ""
    } else {
        lyricsViewTimeout = setTimeout(() => {
            document.getElementById("lyric-holder").style.maxHeight = "100vh"
        }, 250);
        document.getElementById("info-panel").style.bottom = ""
        document.getElementById("info-panel").style.flex = ""
        document.getElementById("info-panel").style.display = ""
        document.getElementById("info-panel").style.marginTop = "7vh"
        document.getElementById("info-panel-contents").style.flexDirection="row";
        
        // Reset landscape styles
        document.getElementById("lyric-holder").style.maxWidth = "100vw"
        document.getElementById("lyrics-flex").style.opacity = "1"
        document.getElementById("lyrics-flex").style.flex = "1"
        document.getElementById("main-body").style.gap = ""
    }
    return
}

function hideBackground(){
    document.getElementById("canvas-hider").style.opacity = "1"
}

function showBackground(){
    document.getElementById("canvas-hider").style.opacity = "0"
}