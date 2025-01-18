current_time = -1;
current_index = 0

function initializeLyrics(){
    document.getElementById("lyric-holder").innerHTML = ""
    
    let totalhtml = ""
    for (let i = 0; i<7; i++){ //invis elements to push down first lines to center
        let html = `<h2 style='font-size:27px; opacity:0.4; transition:0.25s; font-weight:500; width:69.43%; min-height:fit-content;'> <h2>`
        totalhtml+=(html)
    }
    for (let i = 0; i<lyrics.length; i++){
        let html = `<h2 style='font-size:27px; opacity:0.4; transition:0.25s; font-weight:500; width:69.43%; min-height:fit-content;' id=${i}>${lyrics[i]}<h2>`
        totalhtml+=(html)
    }
    for (let i = 0; i<7; i++){ //invis elements to push up last lines to center
        let html = `<h2 style='font-size:27px; opacity:0.4; transition:0.25s; font-weight:500; width:69.43%; min-height:fit-content;'> <h2>`
        totalhtml+=(html)
    }
    document.getElementById("lyric-holder").innerHTML=totalhtml
    current_index = 0;
    current_time = -1;
    document.getElementById("lyric-holder").scrollTo(0,0)
}

function displayLyricOneAtATime(seconds, identifier){
    if (seconds < current_time){
        console.log("Went backwards")
        document.getElementById("lyric-holder").scrollTo(0,0)
        let lyric_list = document.getElementById("lyric-holder").children
        for (let item of lyric_list){
            console.log(item.id)
            if (item.id != null && item.id != undefined){
                try {
                    resetLyric(item.id)
                } catch {
                    console.log("Goofyscript")
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
        console.log("finished backwards reset")
    }
    current_time = seconds;
    
    if (seconds >= tim[current_index]){
        console.log("UPDATING LYRICS AT "+seconds)
        highlightLyric(current_index)
        if (current_index-1 >= 0){
            resetLyric(current_index-1)
        }
        current_index++;

        if (seconds >= tim[current_index]){
            console.log("RUNNING CATCH UP")
            while(seconds >= tim[current_index]){
                if (current_index > 0){
                    resetLyric(current_index-1)
                } 
                current_index++;
            }
            highlightLyric(current_index-1)
            
        }
    } else {
        console.log("NOT UPDATING LYRICS AT "+seconds)

    }
}


const canvas = document.getElementById("backgroundCanvas")
console.log("Initial canvas dimensions:", canvas.width, canvas.height);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// Also log the viewport size to compare
console.log("Viewport dimensions:", window.innerWidth, window.innerHeight);
const ctx = canvas.getContext("2d")
var images = []
const speedsX = [-0.1, -0.12, -0.15, -0.17, -0.2, 0.1, 0.12, 0.15, 0.17, 0.2]
const speedsY = [-0.15, 0.17, -0.1, 0.12, -0.15, 0.1, -0.12, 0.2, -0.17, 0.2]

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
        console.log(color1, color2)
        document.body.style.backgroundImage = `linear-gradient(${Math.floor(Math.random() * 361)}deg, ${color1},  ${color2}`
    };
}

function createAnimatedBackground(imageUrl){
    createStaticBackground(imageUrl)
    images = []
    console.log("CREATING ANIMATED BACKGROUND", imageUrl)
    for (let i = 0; i<10; i++){
        images.push(new BackgroundMovingImage(imageUrl, Math.floor(Math.random() * canvas.width - (canvas.width/2)) + canvas.width/2, Math.floor(Math.random() * canvas.height - (canvas.height/2)) + canvas.height/2, defaultWarp, speedsX[i], speedsY[i]))
    }
}

function animate(){
    //console.log("Canvas dimensions during animation:", canvas.width, canvas.height);

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    images.forEach(image => {
        image.updatePosition()
        image.draw()
    })
    requestAnimationFrame(animate)
}
animate()

function updateTimestamp(elapsed, total){
    document.getElementById("progressbar").style.width = ((elapsed / total)  *100)+"%";
}

function highlightLyric(lyric_id){
    document.getElementById(lyric_id).style.height = "37px"
    document.getElementById(lyric_id).style.fontSize = "37px"
    document.getElementById(lyric_id).style.opacity = 1
    document.getElementById(lyric_id).style.fontWeight = 800;
    document.getElementById(lyric_id).style.width = "90%";
    document.getElementById(lyric_id).scrollIntoView(scrollIntoViewOptions={"block":"center", "behavior":"smooth"})

}

function resetLyric(lyric_id){
    document.getElementById(lyric_id).style.opacity = 0.4;
    document.getElementById(lyric_id).style.fontSize = "27px"
    document.getElementById(lyric_id).style.height = "20px"
    document.getElementById(lyric_id).style.width = "69.43%";
    document.getElementById(lyric_id).style.fontWeight = 500;

}

function hideLyricsView(){
    document.getElementById("lyrics-flex").style.display = "none"
}

function showLyricsView(){
    document.getElementById("lyrics-flex").style.display = "flex"
}