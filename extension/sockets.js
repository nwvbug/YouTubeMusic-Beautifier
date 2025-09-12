//the offscreen document is spawned with the reasoning "audio playback" because if sound is playing
//chrome cannot sleep the document (interrupting the socket connection)
//unfortunately socket connection itself is not a valid offscreen document reason, so have to use this
function playSilentAudio() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createBufferSource();
        source.buffer = audioContext.createBuffer(1, 1, 22050); // 1 frame of silence
        source.connect(audioContext.destination);
        source.loop = true;

        // The AudioContext starts in a 'suspended' state and must be resumed by a user gesture.
        // The creation of the offscreen document by the service worker (triggered by a user
        // action) provides this gesture.
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        source.start(0);
        console.log("Offscreen: Silent audio playback started for persistence.");
    } catch (e) {
        console.error("Offscreen: Could not start silent audio for persistence.", e);
    }
}

playSilentAudio();


//const WS_URL = "http://127.0.0.1:7071"
const WS_URL = "https://ws.nwvbug.com"
var last_packet;
var client_count = 0;
var allow_remote = null
let socket;
let identity = undefined
socket = io(WS_URL, {
    auth: (callback) => {
        callback({
            role: "host",
            identity: identity // This uses the CURRENT value of identity
        });
    },
})


socket.on("provide-identity", function(data){
    console.log("Identity Provided")
    identity = data["identity"]
    sendToManager({event:"ready"})
})

socket.on("invalid-identity", function(data){
    console.log("Reconnect happened too late- server removed data")
})

window.addEventListener("beforeunload", () =>{
    
})

function sendToManager(data){
    chrome.runtime.sendMessage({origin:"offscreen", payload:data})
}

function send_packet(data_to_send){
    
    socket.emit("update", {"current_playing":data_to_send})
}

socket.on("request-update", function(data){
    console.log("Update Requested")
    send_packet(last_packet)
})

socket.on("room-created", function(data){
    console.log("ROOM CREATED")
    let room_id = data["room_id"];
    sendToManager({event:"room_created", data:room_id})
    live = true;
})
    


socket.on("update", function(data){
    console.log("own update heard")
})

socket.on("client-disconnected", function(data){
    console.log("A client has disconnected")
    console.log(data["client_internal_id"])
    sendToManager({event:"client_disconnected", data:data["client_internal_id"]})
})

socket.on("client-joined", function(data){
    console.log("a client has joined")
    console.log(data["client_os"])
    console.log(data["client_internal_id"])
    sendToManager({event:"client_joined", data:data})
})

function kick(client_id){
    socket.emit("kick", {"client_internal_id":client_id})
}

socket.on("control-authorized", function(data){
    console.log("A control of type "+data["requested-action"]+" has been requested")
    switch (data["requested-action"]){
        case "pause":
            sendToManager({event:"pause", data:data})
            break;
        case "skip-next":
            sendToManager({event:"skip", data:data})
            break;
        case "skip-previous":
            sendToManager({event:"prev", data:data})
            break;
    }
})

socket.on("disconnect", function(data){
    console.warn("Socket disconnected from server.")
})

var qrcode;
function setupSharing(){
    console.log("SENDING CREATE ROOM TO SERVER")
    //emit to worker
    //socket.emit("create_room", {"host_details":{"host_name":"test", "host_device_type":getOS()}, "allow_remote_control":document.getElementById("remote-control-check").checked})
   socket.emit("create-room", {"host_details":{"host_name":"test", "host_device_type":getOS()}, "allow_remote_control":allow_remote})
}


function disableSharing(){
    
    //disconnect from sockets, emit to worker
    //socket.emit("dispose-room")
    socket.emit("dispose-room", {"identity":identity})
    socket.disconnect()
    live = false
    sendToManager({event:"request_termination", data:null})
}

function simulateDisconnect(){
    socket.disconnect()
    setTimeout(() => {
        socket.connect()
    }, 1000);
}

function getOS(){
  let os = "Unknown Device";
  let nav = navigator.userAgent

  if (nav.includes("Win")){
    os = "Windows"
  } else if (nav.includes("Mac")){
    os = "MacOS"
  } else if (nav.includes("Linux")){
    os = "Linux"
  } else if (nav.includes("Android")){
    os = "Android"
  } else if (nav.includes("iPhone") || nav.includes("iPad")){
    os = "iOS"
  }

  return os
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.destination != "offscreen"){
        return
    }

    console.log("Request recieved")

    let payload = request.payload
    switch (payload){
        case "kick_user":
            kick(request.user_id)
            break
        case "disable_sharing":
            disableSharing()
            break
        case "start_sharing":
            allow_remote = request.remote
            setupSharing()
            break
        case "update":
            last_packet = request.data
            send_packet(request.data)
    }
})



