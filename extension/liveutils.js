let live = false
let client_count = 0
let code;
//let root_url = "http://ytmbeta.nwvbug.com"
let root_url = "http://ytm.nwvbug.com"
var qrcode = new QRCode("qrcode")

document.getElementById("remote-control-check").onclick = swapRC;


function swapRC(){
    allow_remote = document.getElementById("remote-control-check").checked
    chrome.runtime.sendMessage({type:"WEBAPP_SWAP_REMOTE_CONTROL", payload:{"allow_remote_control":allow_remote}})
}

function generateQrCode(roomcode){
    code = roomcode
    qrcode.clear()
    qrcode.makeCode(root_url+"/live?code="+roomcode)
    document.getElementById("qrcode").style.display = ""
    document.getElementById("codetext").innerText = "Room Code: "+roomcode
    document.getElementById("codetext").style.fontSize = 18
    document.getElementById("textcodeholder").style.marginTop = "20px"
    document.getElementById("copyicon").style.display = ""
    //document.getElementById("clientinfo").style.display = ""
    document.getElementById("startsharing").style.backgroundColor = "rgba(255, 0, 0, 1)"
    document.getElementById("startsharing").style.color = "white"
    document.getElementById("startsharing").innerText = "Stop Sharing"
    document.getElementById("startsharing").onclick = disableSharing
    document.getElementById("sharingpath1").setAttribute("fill", "red")
    document.getElementById("sharingpath2").setAttribute("fill", "red")
    document.getElementById("instructions").style.display = ""
}

function clientDisconnected(client_id){
    console.log("Client Disconnected")
    // client_count--;
    // document.getElementById("devices_connected").innerText = "You have "+client_count+" devices connected."
    // document.getElementById("device-"+client_id).remove()
}

function clientJoined(client_data){
    console.log("Client Joined")
    // client_count++;
    // document.getElementById("devices_connected").innerText = "You have "+client_count+" devices connected."
    // document.getElementById("connected_device_list").innerHTML += `
    // <div class="source-entry" style="width:100%; display:flex; flex-direction: row; align-items: center; justify-content: space-between;" id="device-${client_data["client_internal_id"]}">
    //     <div class="source-name">
    //         <p style="font-size:18px;">${client_data["client_os"]}</p>  
    //     </div>
    //     <div class="generic-button" style="background-color: red; color:white; border-radius:10px; padding:10px; cursor:pointer; font-size:15px; font-weight:bold;" id="kickbutton-${client_data["client_internal_id"]}">
    //         Kick
    //     </div>
    // </div>`
    // document.getElementById("kickbutton-"+client_data["client_internal_id"]).onclick = function(){
    //     chrome.runtime.sendMessage({type:"WEBAPP_KICK_USER", payload:{user_id:client_data["client_internal_id"]}})
    // }
}

function setupSharing(){
    try {
        qrcode.clear()
    } catch {
        console.log("QRCode not initialized")
    }
    document.getElementById("qrcode").style.display = "none"
    document.getElementById("shareinfo").style.display = ""
    document.getElementById("textcodeholder").style.marginTop = "0px"
    document.getElementById("codetext").innerText = "Starting your Live Share"
    document.getElementById("copyicon").style.display = "none"
    document.getElementById("codetext").style.fontSize = 14

    let data_to_send = {
        "allow_remote_control":document.getElementById("remote-control-check").checked
    }
    console.log("Attempting to start sharing")
    chrome.runtime.sendMessage({type:"WEBAPP_START_SHARING", payload:data_to_send})
    live = true
}
document.getElementById("startsharing").onclick = setupSharing;

function disableSharing(){
    document.getElementById("shareinfo").style.display = "none"
    document.getElementById("clientinfo").style.display = "none"
    document.getElementById("startsharing").style.backgroundColor = "white"
    document.getElementById("startsharing").style.color = "black"
    document.getElementById("startsharing").innerText = "Start Sharing"
    document.getElementById("startsharing").onclick = setupSharing;
    document.getElementById("sharingpath1").setAttribute("fill", "white")
    document.getElementById("sharingpath2").setAttribute("fill", "white")
    chrome.runtime.sendMessage({type:"WEBAPP_DISABLE_SHARING"})
    
}

async function copyCode(){
    try {
        await navigator.clipboard.writeText("https://ytm.nwvbug.com/live?code="+code)
        document.getElementById("copied-text").innerText = "Live Share link copied to clipboard."
        document.getElementById("copied-notif").style.opacity = "1"
        document.getElementById("copied-notif").style.pointerEvents = "all"
        setTimeout(()=>{
            document.getElementById("copied-notif").style.opacity = "0"
            document.getElementById("copied-notif").style.pointerEvents = "none"
        }, 3000) 
    } catch {
        document.getElementById("copied-text").innerText = "Failed to copy to clipboard (Check permissions)"
        document.getElementById("copied-notif").style.opacity = "1"
        document.getElementById("copied-notif").style.pointerEvents = "all"
        setTimeout(()=>{
            document.getElementById("copied-notif").style.opacity = "0"
            document.getElementById("copied-notif").style.pointerEvents = "none"
        }, 3000) 
    }
}

document.getElementById("copyicon").onclick = copyCode