
current_index = 0

function initializeLyrics(){
    document.getElementById("lyric-holder").innerHTML = ""
    document.getElementById("lyric-holder").scrollTo(0,0)
    let totalhtml = ""
    for (let i = 0; i<lyrics.length; i++){
        let html = `<h2 style='font-size:20px; opacity:0.4; transition:0.25s;' id=${i}>${lyrics[i]}<h2>`
        totalhtml+=(html)
    }
    document.getElementById("lyric-holder").innerHTML=totalhtml
    current_index = 0;
}

function displayLyricOneAtATime(seconds){
    if (seconds >= tim[current_index]){
        console.log("UPDATING LYRICS AT "+seconds)
        document.getElementById(current_index).style.fontSize = "27px"
        document.getElementById(current_index).style.opacity = 1
        document.getElementById(current_index).scrollIntoView(scrollIntoViewOptions={"block":"center"})
        if (current_index-1 >= 0){
            document.getElementById(current_index-1).style.opacity = 0.4;
            document.getElementById(current_index-1).style.fontSize = "20px"
        }
        current_index++;
    } else {
        console.log("NOT UPDATING LYRICS AT "+seconds)

    }
}

function colorize(img_src){
    const canvas = document.getElementById('backgroundCanvas');
    const ctx = canvas.getContext('2d');

    // Load the album art image
    const img = new Image();
    img.crossOrigin = "anonymous"
    img.src = img_src; 

    
    img.onload = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      
        const numCopies = Math.floor(Math.random() * 10) + 5; // Random number of copies (5-14)
      
        // Create an offscreen canvas for the blurred background
        const offscreenCanvas = document.createElement('canvas');
        const offscreenCtx = offscreenCanvas.getContext('2d');
        offscreenCanvas.width = canvas.width;
        offscreenCanvas.height = canvas.height;
      
        for (let i = 0; i < numCopies; i++) {
          // Random scale and rotation
          const scaleX = Math.random() * 4 + 0.5; // Increased scale for more distortion
          const scaleY = Math.random() * 4 + 0.5;
          const rotation = Math.random() * Math.PI * 2; 
      
          // Random position
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
      
          offscreenCtx.save();
          offscreenCtx.translate(x, y);
          offscreenCtx.rotate(rotation);
          offscreenCtx.scale(scaleX, scaleY);
      
          // Draw the image on the offscreen canvas
          offscreenCtx.drawImage(img, -img.width / 2, -img.height / 2);
      
          offscreenCtx.restore();
        }
      
        // Apply a very strong blur
        offscreenCtx.filter = 'blur(50px)'; // Increased blur radius
      
        // Draw the blurred background onto the main canvas
        ctx.drawImage(offscreenCanvas, 0, 0); 
      
        // Clear the offscreen canvas (optional)
        //offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height); 
      };
    
}