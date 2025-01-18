class BackgroundMovingImage {
    constructor(imageUrl, width, height, distortionFunction){
        this.height = height;
        this.width = width;
        this.x = Math.floor(Math.random() * canvas.width)
        this.y = Math.floor(Math.random() * canvas.height)
        this.velocityX = speeds[(Math.floor(Math.random() * (8 + 1)))]
        this.velocityY = speeds[(Math.floor(Math.random() * (8 + 1)))]
        // console.log("Initial position:", this.x, this.y);
        // console.log("Initial velocities:", this.velocityX, this.velocityY);
        this.distortedCanvas = null;
        this.initialize(imageUrl, distortionFunction)
    }

    initialize(imageUrl, distortionFunction) {
        console.log("Init image")
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src= imageUrl
    
        img.onload = () =>{
            this.distortedCanvas = new OffscreenCanvas(this.width, this.height);
            // this.distortedCanvas.width = this.width;
            // this.distortedCanvas.height = this.height;
            const distortedCtx = this.distortedCanvas.getContext("2d");
            distortedCtx.beginPath();
            distortedCtx.arc(this.width/2, this.height/2, (this.width/3), 0, Math.PI*2); // Circle with center at (150, 150) and radius 100
            distortedCtx.closePath();

            // Clip the canvas to the path
            distortedCtx.clip();

            distortedCtx.drawImage(img, 0, 0, this.width, this.height);
            const imageData = distortedCtx.getImageData(0, 0, this.width, this.height);
            distortionFunction(imageData)
            distortedCtx.putImageData(imageData, 0, 0)
        }
    }

    updatePosition(){
        let oldX = this.x;
        let oldY = this.y;
        //console.log("Before movement - Y:", this.y, "velocityY:", this.velocityY);

        this.x += this.velocityX;
        this.y += this.velocityY;
        //console.log("after movement - Y:", this.y, "velocityY:", this.velocityY);

        // console.log(`Position changed from (${oldX}, ${oldY}) to (${this.x}, ${this.y})`);
        // console.log(`Current velocities: (${this.velocityX}, ${this.velocityY})`);

        // Check X bounds
        if (this.x < 0 || this.x > canvas.width) {
            this.velocityX = -this.velocityX;
        }

        // Check Y bounds
        if (this.y < 0 || this.y > canvas.height) {
            this.velocityY = -this.velocityY;   
        }
    }

    draw(){
        if (this.distortedCanvas) {
            //console.log("Drawing image.. (this is printed)")
            ctx.drawImage(this.distortedCanvas, this.x, this.y)
        }
    }
}