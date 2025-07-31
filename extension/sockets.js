// REQUIRES     <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.js" integrity="sha512-q/dWJ3kcmjBLU4Qc47E4A9kTB4m3wuTY7vkFJDTZKjTs8jhyGQnaUrxa0Ytd0ssMZhbNua9hE+E7Qv1j+DyZwA==" crossorigin="anonymous"></script>
var client_count = 0;

const socket = io(WS_URL, {
    auth: {
        role:"host",
    }
});

document.getElementById("device-name-input").value = getOS()

window.addEventListener("beforeunload", () =>{
    socket.emit("disconnect")
})


function send_packet(){
    let data_to_send = {
        "song_name":current_song_title,
        "song_artist":current_song_artist,
        "song_album":current_song_album,
        "total_time":totalDuration,
        "elapsed_time":current_time,
        "song_identifier":current_song,
        "pause_state":(document.getElementById("pauseplaybutton").getAttribute("data-paused")),
        "incoming_second_offset":incomingSecondOffset,
        "lyrics_bank":lyrics,
        "times_bank":tim,
        "album_art":current_song_album_art,
        "lyric_freshness":lyrics_fresh,
        "allow_remote_control":document.getElementById("remote-control-check").checked

    }
    socket.emit("update", {"current_playing":data_to_send})
}

socket.on("request_update", function(data){
    console.log("Update Requested")
    send_packet()
})

socket.on("room_created", function(data){
    let room_id = data["room_id"];
    generateQrCode(room_id)
    live = true;
})

socket.on("update", function(data){
    console.log("Own update heard.")
})

socket.on("client_disconnected", function(data){
    console.log("A client has disconnected")
    console.log(data["client_internal_id"])
    client_count--;
    document.getElementById("devices_connected").innerText = "You have "+client_count+" devices connected."
    document.getElementById("device-"+data["client_internal_id"]).remove()
})

socket.on("client_joined", function(data){
    console.log("a client has joined")
    console.log(data["client_os"])
    console.log(data["client_internal_id"])
    client_count++;
    document.getElementById("devices_connected").innerText = "You have "+client_count+" devices connected."
    document.getElementById("connected_device_list").innerHTML += `
    <div class="source-entry" style="width:100%; display:flex; flex-direction: row; align-items: center; justify-content: space-between;" id="device-${data["client_internal_id"]}">
        <div class="source-name">
            <p style="font-size:18px;">${data["client_os"]}</p>  
        </div>
        <div class="generic-button" style="background-color: red; color:white; border-radius:10px; padding:10px; cursor:pointer; font-size:15px; font-weight:bold;" id="kickbutton-${data["client_internal_id"]}">
            Kick
        </div>
    </div>`
    document.getElementById("kickbutton-"+data["client_internal_id"]).onclick = function(){
        socket.emit("kick", {"client_internal_id":data["client_internal_id"]})
    }
})

socket.on("control-authorized", function(data){
    console.log("A control of type "+data["requested-action"]+" has been requested")
    switch (data["requested-action"]){
        case "pause":
            pausePlay()
            break;
        case "skip-next":
            skip();
            break;
        case "skip-previous":
            previous();
            break;
    }
})

var qrcode;
function setupSharing(){
    let data_to_send = {
        "allow_remote_control":document.getElementById("remote-control-check").checked

    }
    socket.emit("create_room", {"host_details":{"host_name":"test", "host_device_type":getOS()}, "allow_remote_control":document.getElementById("remote-control-check").checked})
   
}
document.getElementById("startsharing").onclick = setupSharing;

function disableSharing(){
    document.getElementById("shareinfo").style.display = "none"
    document.getElementById("clientinfo").style.display = "none"
    document.getElementById("startsharing").style.backgroundColor = "white"
    document.getElementById("startsharing").style.color = "black"
    document.getElementById("startsharing").innerText = "Start Sharing"
    //disconnect from sockets
    socket.emit("dispose-room")
    live = false
    document.getElementById("startsharing").onclick = setupSharing;
    document.getElementById("sharingpath1").setAttribute("fill", "white")
    document.getElementById("sharingpath2").setAttribute("fill", "white")
}

function generateQrCode(roomcode){
    try{
        qrcode.clear()
        qrcode.makeCode("http://ytmbeta.nwvbug.com/live?code="+roomcode)
    } catch {
        console.log("QRCode not initialized, creating new one")
        qrcode = new QRCode("qrcode", {
            text: "http://ytmbeta.nwvbug.com/live?code="+roomcode
        });
    }
    
    document.getElementById("codetext").innerText = "Room Code: "+roomcode
    document.getElementById("codetext").style.fontSize = 18
    document.getElementById("shareinfo").style.display = ""
    document.getElementById("clientinfo").style.display = ""
    document.getElementById("startsharing").style.backgroundColor = "rgba(255, 0, 0, 1)"
    document.getElementById("startsharing").style.color = "white"
    document.getElementById("startsharing").innerText = "Stop Sharing"
    document.getElementById("startsharing").onclick = disableSharing
    document.getElementById("sharingpath1").setAttribute("fill", "red")
    document.getElementById("sharingpath2").setAttribute("fill", "red")
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
