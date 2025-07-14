// REQUIRES     <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.js" integrity="sha512-q/dWJ3kcmjBLU4Qc47E4A9kTB4m3wuTY7vkFJDTZKjTs8jhyGQnaUrxa0Ytd0ssMZhbNua9hE+E7Qv1j+DyZwA==" crossorigin="anonymous"></script>
const socket = io(WS_URL, {
    auth: {
        role:"host",
    }
});

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
        "pause_state":(document.getElementById("pauseplaybutton").src != "assets/pause.png"),
        "incoming_second_offset":incomingSecondOffset,
        "lyrics_bank":lyrics,
        "times_bank":tim,
        "album_art":current_song_album_art,
        "lyric_freshness":lyrics_fresh
    }
    socket.emit("update", {"current_playing":data_to_send})
}

socket.on("room_created", function(data){
    let room_id = data["room_id"];
    generateQrCode(room_id)
    live = true;
})

socket.on("update", function(data){
    console.log("Own update heard.")
})

var qrcode;
function setupSharing(){
    let data_to_send = {
        "song_name":current_song_title,
        "song_artist":current_song_artist,
        "song_album":current_song_album,
        "total_time":totalDuration,
        "elapsed_time":current_time,
        "song_identifier":current_song,
        "pause_state":(document.getElementById("pauseplaybutton").src != "assets/pause.png"),
        "incoming_second_offset":incomingSecondOffset,
        "lyrics_bank":lyrics,
        "times_bank":tim,
        "album_art":current_song_album_art
    }
    socket.emit("create_room", {"host_details":{"host_name":"test", "host_device_type":navigator.platform}, "current_playing":data_to_send})
   
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