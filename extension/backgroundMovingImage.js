class BackgroundMovingImage {
    static MAX_PROCESS_SIZE = 400;

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
        const scale = Math.min(
            BackgroundMovingImage.MAX_PROCESS_SIZE / this.width,
            BackgroundMovingImage.MAX_PROCESS_SIZE / this.height,
            1
        );
        const processWidth = Math.max(1, Math.floor(this.width * scale));
        const processHeight = Math.max(1, Math.floor(this.height * scale));

        const buildCanvas = (img) => {
            this.distortedCanvas = new OffscreenCanvas(processWidth, processHeight);
            const distortedCtx = this.distortedCanvas.getContext("2d");
            distortedCtx.beginPath();
            distortedCtx.arc(processWidth/2, processHeight/2, processWidth/3, 0, Math.PI*2);
            distortedCtx.closePath();
            distortedCtx.clip();
            distortedCtx.drawImage(img, 0, 0, processWidth, processHeight);
            try {
                const imageData = distortedCtx.getImageData(0, 0, processWidth, processHeight);
                distortionFunction(imageData)
                distortedCtx.putImageData(imageData, 0, 0)
            } catch (e) {
                // Tainted canvas (cross-origin) — image still shows, just no distortion
            }
        };

        this.img = new Image();
        this.img.crossOrigin = "Anonymous";
        this.img.onload = () => buildCanvas(this.img);
        this.img.onerror = () => {
            // CORS load failed, retry without crossOrigin
            const retryImg = new Image();
            retryImg.onload = () => buildCanvas(retryImg);
            retryImg.src = imageUrl;
        }
        this.img.src = imageUrl;
    }

    updatePosition(){
        this.x += this.velocityX;
        this.y += this.velocityY;

        if (this.x < 0-this.width/2 && this.velocityX < 0) {
            this.velocityX = -this.velocityX;
        } else if (this.x > (canvas.width-this.width/2) && this.velocityX > 0) {
            this.velocityX = -this.velocityX;
        }

        if (this.y < 0 - this.height/2 && this.velocityY < 0) {
            this.velocityY = -this.velocityY;
        } else if (this.y > (canvas.height - this.height/2) && this.velocityY > 0) {
            this.velocityY = -this.velocityY;
        }

        this.angle += this.rotationSpeed;
    }

    draw(){
        if (this.distortedCanvas) {
            ctx.save();
            ctx.translate(this.x + this.width/2, this.y + this.height/2);
            ctx.rotate(this.angle);
            ctx.drawImage(
                this.distortedCanvas,
                -this.width/2,
                -this.height/2,
                this.width,
                this.height
            );
            ctx.restore();
        }
    }
}