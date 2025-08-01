importScripts("socket.io.js")

let socket;
socket = io("https://ytmbeta.nwvbug.com", {
    auth: {
        role:"host",
    }
})

socket.on("disconnect", function(data){
    console.log("Disconnected from server. Reason:", data);
    self.postMessage({type:"status", payload: {message:"disconnected", data}})
})

socket.on("request_update", function(data){
    self.postMessage({type:"event", payload: {message:"request_update", data}})
})

socket.on("room_created", function(data){
    self.postMessage({type:"event", payload: {message:"room_created", data}})
})

socket.on("update", function(data){
    self.postMessage({type:"status", payload: {message:"update", data}})
})

socket.on("client_disconnected", function(data){
    self.postMessage({type:"event", payload: {message:"client_disconnected", data}})
})

socket.on("client_joined", function(data){
    self.postMessage({type:"event", payload: {message:"client_joined", data}})
})

socket.on("control-authorized", function(data){
    self.postMessage({type:"event", payload: {message:"control_authorized", data}})
})

self.onmessage = function(event) {
    const { type, event: eventName, payload } = event.data;
    if (type=="emit"){
        socket.emit(eventName, payload)
    }
}

