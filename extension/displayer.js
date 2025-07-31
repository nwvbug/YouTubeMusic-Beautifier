current_time = -1;
current_index = 0
var doAnimation = true;

function initializeLyrics(){
    document.getElementById("lyric-holder").style.maxWidth = ""
    document.getElementById("lyric-holder").innerHTML = ""
    
    let totalhtml = ""
    for (let i = 0; i<20; i++){ //invis elements to push down first lines to center
        let html = `<div></div>`
        totalhtml+=(html)
    }
    for (let i = 0; i<lyrics.length; i++){
        let html = `<div id=${i} style="cursor:pointer;">${lyrics[i]}</div>`
        totalhtml+=(html)
    }
    for (let i = 0; i<20; i++){ //invis elements to push up last lines to center
        let html = `<div></div>`
        totalhtml+=(html)
    }
    document.getElementById("lyric-holder").innerHTML=totalhtml;

    for (let item of document.getElementById("lyric-holder").children){
        if (item.id != null && item.id != undefined){
            try {
                item.onclick = function(){selectNewLyric(parseInt(item.id))}
            } catch {

            }
            
        }
    }

    //document.getElementById("lyric-holder").style.maxWidth = document.getElementById("lyric-holder").offsetWidth
    current_index = 0;
    current_time = -1;
    highlightLyric(0)
}

function selectNewLyric(i){
    console.log("attempting to select lyric "+i)
    requestScanTo(tim[i])
}

function displayLyricOneAtATime(seconds, identifier=null){
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
const speedsX = [-0.15, 0.17, -0.1, 0.12, -0.15, -0.1, -0.12, -0.15, -0.17, -0.2, 0.1, 0.12, 0.15, 0.17, 0.2]
const speedsY = [-0.15, 0.17, -0.1, 0.12, -0.15, 0.1, -0.12, 0.2, -0.17, 0.2, -0.15, 0.17, -0.1, 0.12, -0.15,]

const rotationSpeeds = [0.0001, -0.0002, 0.0003, -0.0004, 0.0005, -0.0001, 0.0002, -0.0003, 0.0004, -0.0005, -0.0003, 0.0004, -0.0005, 0.0003, -0.0004]

function createStaticBackground(imageUrl){
    
    const image = new Image();
    image.src = imageUrl
    image.crossOrigin = "Anonymous"
    image.onload = () => {
        let offscreenCanvas = new OffscreenCanvas(image.width, image.height);
        let ctx = offscreenCanvas.getContext('2d');

        ctx.drawImage(image, 0, 0);

        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let commons = getMostCommonColorValue(imageData)

        let color1 = findBackgroundColor(imageData, commons[0]);
        let color2 = findBackgroundColor(imageData, commons[1]);
        document.body.style.backgroundImage = `linear-gradient(${Math.floor(Math.random() * 361)}deg, ${color1},  ${color2}`
    };
}



function createAnimatedBackground(imageUrl){
    createStaticBackground(imageUrl)
    images = []
    for (let i = 0; i<15; i++){
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
    requestAnimationFrame(animate)
}
animate()


function updateTimestamp(elapsed, total){
    document.getElementById("progressbar").style.width = ((elapsed / total)  *100)+"%";
    document.getElementById("progressbar-portrait").style.width = ((elapsed / total)  *100)+"%";
}

function highlightLyric(lyric_id){
    if (window.innerWidth > 1300){
        document.getElementById(lyric_id).style.width = "100%"
        document.getElementById(lyric_id).style.fontSize = "40px"
    }
    else {
        document.getElementById(lyric_id).style.scale = "1.2"
    }

    document.getElementById(lyric_id).style.opacity = 1
    document.getElementById(lyric_id).style.fontWeight = 800;
    document.getElementById(lyric_id).scrollIntoView(scrollIntoViewOptions={"block":"center", "behavior":"smooth"})

}

function resetLyric(lyric_id){
    
    document.getElementById(lyric_id).style.width = "80%"
    document.getElementById(lyric_id).style.fontSize = "32px"
    document.getElementById(lyric_id).style.scale = "1"

    document.getElementById(lyric_id).style.opacity = 0.4;
    
    document.getElementById(lyric_id).style.fontWeight = 500;

}
function hideLyricsView(){
    if (window.innerWidth > 1300){
        document.getElementById("lyric-holder").style.maxWidth = "0vw"
        document.getElementById("lyrics-flex").style.opacity = "0"
        document.getElementById("lyrics-flex").style.flex = "0"
        document.getElementById("info-panel").classList.toggle("closed", true)
        document.getElementById("main-body").style.gap = "0"
    } else {
        document.getElementById("lyric-holder").style.maxHeight = "0vh"
        document.getElementById("info-panel").style.flex = "1"
        document.getElementById("info-panel").style.display = "flex"
        document.getElementById("info-panel").style.marginTop = "0"
        document.getElementById("info-panel").style.bottom = "0"
        document.getElementById("info-panel").style.top = "0"
        document.getElementById("info-panel-contents").style.flexDirection="column";
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
    showLyricsView()
}

function showLyricsView(){
    if (window.innerWidth > 1300){
        setTimeout(() => {
            document.getElementById("lyric-holder").style.maxWidth = "50vw"
        }, 250);
        document.getElementById("lyrics-flex").style.opacity = "1"
        document.getElementById("main-body").style.gap = "10vw"
        document.getElementById("lyrics-flex").style.flex = "1"
        document.getElementById("info-panel").classList.toggle("closed", false)
        document.getElementById("info-panel-contents").style.flexDirection="column";

    } else {
        
    
        setTimeout(() => {
            document.getElementById("lyric-holder").style.maxHeight = "100vh"
        }, 250);
        document.getElementById("info-panel").style.bottom = ""
        
        document.getElementById("info-panel").style.flex = ""
        document.getElementById("info-panel").style.display = ""
        document.getElementById("info-panel").style.marginTop = "7vh"
        document.getElementById("info-panel-contents").style.flexDirection="row";
    }
    return
}

function hideBackground(){
    document.getElementById("canvas-hider").style.opacity = "1"
}

function showBackground(){
    document.getElementById("canvas-hider").style.opacity = "0"
}