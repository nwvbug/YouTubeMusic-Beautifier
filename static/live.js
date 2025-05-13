// REQUIRES     <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.js" integrity="sha512-q/dWJ3kcmjBLU4Qc47E4A9kTB4m3wuTY7vkFJDTZKjTs8jhyGQnaUrxa0Ytd0ssMZhbNua9hE+E7Qv1j+DyZwA==" crossorigin="anonymous"></script>
const socket = io("localhost:7070", {
    auth: {
        role:"client",
    }
});

console.log("Live")

function checkCode(){
  let code = document.getElementById("inpt").value
  code = code.trim();
  if (code.length == 6){
    
    
    socket.emit("join_music_room", {"room_id":code, "device_details":{"device_type":navigator.platform}})

  }
}

socket.on("room_not_found", function(data){
  console.log("INVALID")
  document.getElementById("inpt").classList.add("incorrect")
  setTimeout(function(){
      document.getElementById("inpt").classList.remove("incorrect")
  }, 550)
})

socket.on("update", function(data){
  console.log(data)
  onUpdate(data)
})

socket.on("room_joined", function(data){
  console.log("room data")
  console.log(data)
  document.getElementById("login").style.display = "none"
  document.getElementById("app-holder").className = ""
})