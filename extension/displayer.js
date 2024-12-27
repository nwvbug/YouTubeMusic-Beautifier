current_time = -1;
current_index = 0

function initializeLyrics(){
    document.getElementById("lyric-holder").innerHTML = ""
    document.getElementById("lyric-holder").scrollTo(0,0)
    let totalhtml = ""
    for (let i = 0; i<4; i++){ //invis elements to push down first lines to center
        let html = `<h2 style='font-size:20px; opacity:0.4; transition:0.25s;'> <h2>`
        totalhtml+=(html)
    }
    for (let i = 0; i<lyrics.length; i++){
        let html = `<h2 style='font-size:20px; opacity:0.4; transition:0.25s;' id=${i}>${lyrics[i]}<h2>`
        totalhtml+=(html)
    }
    for (let i = 0; i<7; i++){ //invis elements to push up last lines to center
        let html = `<h2 style='font-size:20px; opacity:0.4; transition:0.25s;'> <h2>`
        totalhtml+=(html)
    }
    document.getElementById("lyric-holder").innerHTML=totalhtml
    current_index = 0;
    current_time = -1;
}

function displayLyricOneAtATime(seconds){
    if (seconds < current_time){
        console.log("Went backwards")
        
        document.getElementById(current_index).style.opacity = 0.4;
        document.getElementById(current_index).style.fontSize = "20px"
        document.getElementById(current_index).style.height = "20px"
        for (let i = 0; i<tim.length; i++){
            if (seconds >= tim[i]){
                current_index = i;
                break;
            }
        }
    }
    current_time = seconds;
    
    if (seconds >= tim[current_index]){
        console.log("UPDATING LYRICS AT "+seconds)
        document.getElementById(current_index).style.height = "27px"
        document.getElementById(current_index).style.fontSize = "27px"
        document.getElementById(current_index).style.opacity = 1
        document.getElementById(current_index).scrollIntoView(scrollIntoViewOptions={"block":"center", "behavior":"smooth"})
        if (current_index-1 >= 0){
            document.getElementById(current_index-1).style.opacity = 0.4;
            document.getElementById(current_index-1).style.fontSize = "20px"
            document.getElementById(current_index-1).style.height = "20px"
        }
        current_index++;

        if (seconds >= tim[current_index]){
            console.log("RUNNING CATCH UP")
            while(seconds >= tim[current_index]){
                if (current_index > 0){
                    document.getElementById(current_index-1).style.opacity = 0.4;
                    document.getElementById(current_index-1).style.fontSize = "20px"
                    document.getElementById(current_index-1).style.height = "20px"
                } 
                current_index++;
            }
            document.getElementById(current_index-1).style.fontSize = "27px"
            document.getElementById(current_index-1).style.height = "27px"
            document.getElementById(current_index-1).style.opacity = 1
            document.getElementById(current_index-1).scrollIntoView(scrollIntoViewOptions={"block":"center"})
            
        }
    } else {
        console.log("NOT UPDATING LYRICS AT "+seconds)

    }
}

var numCopies;
var images = []
const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');
const speeds = [0.01, 0.05, 0.09, 0.1, 0.15, 0.2, 0.23, 0.12, 0.13]


function colorize(img_src){
    console.log("COLORIZING")
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    images = []
    // Load the album art image
    const img = new Image();
    img.crossOrigin = "anonymous"
    img.src = img_src; 

    
    img.onload = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        numCopies = Math.floor(Math.random() * 10) + 10; // Random number of copies
        
        // Create an offscreen canvas for the blurred background
        const offscreenCanvas = document.createElement('canvas');
        const offscreenCtx = offscreenCanvas.getContext('2d');
        offscreenCanvas.width = canvas.width;
        offscreenCanvas.height = canvas.height;
        offscreenCtx.drawImage(img, 0, 0, canvas.width, canvas.height)
        for (let i = 0; i < numCopies; i++) {
            // Random scale and rotation
            const scaleX = Math.random() + 0.5; // Increased scale for more distortion
            const scaleY = Math.random() + 0.5;
            const rotation = Math.random() / 2; 
        
            // Random position
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            
            const dist1 = Math.random() + 0.25
            const dist2 = Math.random() + 0.25
            
            offscreenCtx.setTransform(1, dist1, dist2, 1, x, y);
        
            // Draw the image on the offscreen canvas
            offscreenCtx.drawImage(img, -img.width / 2, -img.height / 2);
        
            offscreenCtx.restore();
            images.push({"img":img,"negateX":Math.random() < 0.5, "negateY":Math.random() < 0.5, "x":x, "d1":dist1, "d2":dist2, "y":y, "vy":(Math.floor(Math.random() * (8 + 1))), "vx":(Math.floor(Math.random() * (8 + 1))), "rotation":rotation})
        }
      
        // Apply a very strong blur
        //offscreenCtx.filter = 'blur(50px)'; // Increased blur radius
      
        // Draw the blurred background onto the main canvas
        ctx.drawImage(offscreenCanvas, 0, 0); 
      
        // Clear the offscreen canvas (optional)
        //offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height); 
        animate();
    };
    
}

function animate(){
    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    offscreenCtx.drawImage(images[0].img, 0, 0, canvas.width, canvas.height)
    for (let i = 0; i<numCopies; i++){
        let imageObj = images[i]
        let toAddX = speeds[imageObj.vx];
        let toAddY = speeds[imageObj.vy];
        if (imageObj.negateX){
            toAddX = toAddX * -1;
        }
        if (imageObj.negateY){
            toAddY = toAddY * -1;
        }
        imageObj.x += toAddX;
        imageObj.y += toAddY;

        // Keep images within canvas bounds
        if (imageObj.x < 0 || imageObj.x > canvas.width) {
            imageObj.negateX = !imageObj.negateX; // Reverse horizontal direction
        }
        if (imageObj.y < 0 || imageObj.y > canvas.height) {
            imageObj.negateY = !imageObj.negateY; // Reverse vertical direction
        }

        // Update rotation
        offscreenCtx.save();
        offscreenCtx.rotate(imageObj.rotation);
        //offscreenCtx.translate(imageObj.x, imageObj.y)
        offscreenCtx.transform(1, imageObj.d1, imageObj.d2, 1, imageObj.x, imageObj.y)
        offscreenCtx.drawImage(imageObj.img, -imageObj.img.width / 2, -imageObj.img.height / 2);
        offscreenCtx.restore();
    }
    ctx.drawImage(offscreenCanvas, 0, 0); 
}

function updateTimestamp(elapsed, total){
    document.getElementById("progressbar").style.width = ((elapsed / total)  *100)+"%";
}