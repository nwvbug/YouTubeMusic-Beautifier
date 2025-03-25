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

var qrcode;
function setupSharing(){
    //connect to sockets
    //get the room code from init connection
    let room_code = 983472

    generateQrCode(room_code)
}
document.getElementById("startsharing").onclick = setupSharing;

function disableSharing(){
    document.getElementById("shareinfo").style.display = "none"
    document.getElementById("startsharing").style.backgroundColor = "white"
    document.getElementById("startsharing").style.color = "black"
    document.getElementById("startsharing").innerText = "Start Sharing"
    //disconnect from sockets
    socket.disconnect()
    document.getElementById("startsharing").onclick = setupSharing;
    document.getElementById("sharingpath1").setAttribute("fill", "white")
    document.getElementById("sharingpath2").setAttribute("fill", "white")
}

function generateQrCode(roomcode){
    try{
        qrcode.clear()
        qrcode.makeCode("http://ytm.nwvbug.com/live?code="+roomcode)
    } catch {
        console.log("QRCode not initialized, creating new one")
        qrcode = new QRCode("qrcode", {
            text: "http://ytm.nwvbug.com/live?code="+roomcode
        });
    }
    
    document.getElementById("codetext").innerText = "Room Code: "+roomcode
    document.getElementById("codetext").style.fontSize = 18
    document.getElementById("shareinfo").style.display = ""
    document.getElementById("startsharing").style.backgroundColor = "rgba(255, 0, 0, 1)"
    document.getElementById("startsharing").style.color = "white"
    document.getElementById("startsharing").innerText = "Stop Sharing"
    document.getElementById("startsharing").onclick = disableSharing
    document.getElementById("sharingpath1").setAttribute("fill", "red")
    document.getElementById("sharingpath2").setAttribute("fill", "red")
}