// REQUIRES     <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.js" integrity="sha512-q/dWJ3kcmjBLU4Qc47E4A9kTB4m3wuTY7vkFJDTZKjTs8jhyGQnaUrxa0Ytd0ssMZhbNua9hE+E7Qv1j+DyZwA==" crossorigin="anonymous"></script>
const socket = io(WS_URL, {
    auth: {
        role:"host",
        session:window.localStorage.getItem("session")
    }
});

window.addEventListener("beforeunload", () =>{
    socket.emit("disconnect")
})


function send_packet(data){
    data.hostidentifier = navigator.platform
    socket.emit("update", {"intents":"update", "data":data, "session":window.localStorage.getItem("session")})
}

socket.on("identification", function(data){
    console.log("Server response", data)
})

socket.on("left", function(data){
    console.log("device left. role ", data["role"])
})

socket.on("takeover", function(data){
    console.log("Another device logged into your account has taken over hosting")
})

socket.on("update", function(data){
    console.log("Listener requested ", data)
    if (data.intents == "pauseplay"){
        pausePlay()
    }
})