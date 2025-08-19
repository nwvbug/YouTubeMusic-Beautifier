console.log("document")
document.getElementById('openWebApp').addEventListener('click', () => {
    // Open the web app in a new window/tab (adjust as needed)
    const extensionUrl = chrome.runtime.getURL('');
    chrome.tabs.create({ url: extensionUrl+"/webapp.html" });
});


let music_quotes = [
    "Great song choice!",
    "Solid pick! 💯",
    "What a tune!",
    "Certified banger!",
    "Fire choice 🔥",
    "Can't go wrong with this song!",
    "🎶🎶🎶",
    "🎶🤘🤘🎶",
    "🎵🎵🎵🎵",
    "Music always makes a day better.",
    "Top-tier track.",
    "Good call. 👌",
    "Turn it up! 🔊",
    "Now that's a jam.",
    "Hits just right.",
    "You know good music 🎧",
    "Peak music taste 📈",
    "Instant replay material 🔄",
    "Playlist royalty 🎭"
]

const canvas = document.getElementById("backgroundCanvas")
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d")
var images = []
function drawStaticImagedBackground(imageUrl){
    console.log("starting")
    images = []
    for (let i = 0; i<4; i++){
        console.log("pushing")
        images.push(new BackgroundMovingImage(imageUrl, Math.floor(Math.random() * canvas.width) + canvas.width, Math.floor(Math.random() * canvas.height) + canvas.height, defaultWarp, 0.2, 0.2, 0.0005))
    }
    for (let i = 0; i<4; i++){
        console.log("pushing")
        images.push(new BackgroundMovingImage(imageUrl, Math.floor(Math.random() * canvas.width) + canvas.width, Math.floor(Math.random() * canvas.height) + canvas.height, defaultWarp, -0.2, -0.2, -0.0005))
    }
    setTimeout(()=> {
        console.log("timeout")
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        images.forEach(image => {
            
            image.updatePosition()
            image.draw()
        })
    }, 50)
}
function animate(){
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    images.forEach(image => {
        image.updatePosition()
        image.draw()
    })
    
    requestAnimationFrame(animate)
}
animate()

chrome.runtime.sendMessage({origin:"popup", action:"request_image"})
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.origin == "middleman" && request.action == "popup_image"){
        console.log("popup background image")
        console.log(request.payload)
        if (request.payload){
            document.getElementById("musicquotes").innerText = music_quotes[Math.floor(Math.random()*music_quotes.length)]
            document.getElementById("albumart").src=request.payload
            setTimeout(()=>{
                drawStaticImagedBackground(request.payload)
            }, 50)
            setTimeout(()=>{
                document.getElementById("canvasBlocker").style.opacity = "0"
                document.getElementById("canvasBlocker").style.pointerEvents = "none"
            }, 150)
        }
    }
})


