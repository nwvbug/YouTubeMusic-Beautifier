class BackgroundMovingImage {
    constructor(imageUrl, width, height, distortionFunction, velocityX, velocityY, rotationSpeed){
        this.height = height;
        this.width = width;
        this.x = Math.floor(Math.random() * canvas.width) - width/2
        this.y = Math.floor(Math.random() * canvas.height) - height/2
        this.velocityX = velocityX
        this.velocityY = velocityY
        
        this.distortedCanvas = null;
        this.initialize(imageUrl, distortionFunction)
        this.angle = 0;
        this.rotationSpeed = rotationSpeed
    }

    initialize(imageUrl, distortionFunction) {
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

        this.x += this.velocityX;
        this.y += this.velocityY;
        
        if (this.x < 0-this.width/2 && this.velocityX < 0) {
            this.velocityX = -this.velocityX;
        } else if (this.x > (canvas.width-this.width/2) && this.velocityX > 0) {
            this.velocityX = -this.velocityX;
        }

        if (this.y < 0 + ((canvas.height + this.height/2) + (canvas.height/3)) && this.velocityY < 0) {
            this.velocityY = -this.velocityY;
        } else if (this.y > (canvas.height-this.height/2) - (canvas.height/3) && this.velocityY > 0) {
            this.velocityY = -this.velocityY;
        }

        this.angle += this.rotationSpeed;
    }

    draw(){
        if (this.distortedCanvas) {
            ctx.save(); // Save the current context state
            
            // Translate to image center, rotate, then translate back
            ctx.translate(this.x + this.width/2, this.y + this.height/2);
            ctx.rotate(this.angle);
            ctx.drawImage(
                this.distortedCanvas, 
                -this.width/2, // Adjust x position for centered rotation
                -this.height/2, // Adjust y position for centered rotation
                this.width,
                this.height
            );
            
            ctx.restore(); 
        }
    }
}