let live = false
let client_count = 0
let code;
var qrcode = new QRCode("qrcode")

document.getElementById("remote-control-check").onclick = swapRC;


function swapRC(){
    allow_remote = document.getElementById("remote-control-check").checked
    if (isExtension) chrome.runtime.sendMessage({origin:"webapp", payload:"swap-remote-control", data:{"allow_remote_control":allow_remote}})
}

function generateQrCode(roomcode){
    code = roomcode
    qrcode.clear()
    qrcode.makeCode("http://ytm.nwvbug.com/live?code="+roomcode)
    document.getElementById("qrcode").style.display = ""
    document.getElementById("codetext").innerText = "Room Code: "+roomcode
    document.getElementById("codetext").style.fontSize = 18
    document.getElementById("textcodeholder").style.marginTop = "20px"
    document.getElementById("copyicon").style.display = ""
    document.getElementById("startsharing").style.backgroundColor = "rgba(255, 0, 0, 1)"
    document.getElementById("startsharing").style.color = "white"
    document.getElementById("startsharing").innerText = "Stop Sharing"
    document.getElementById("startsharing").onclick = disableSharing
    document.getElementById("sharingpath1").setAttribute("fill", "red")
    document.getElementById("sharingpath2").setAttribute("fill", "red")
    document.getElementById("instructions").style.display = ""
}

function clientDisconnected(client_id){
    //console.log("Client Disconnected")
}

function clientJoined(client_data){
    //console.log("Client Joined")
}

function setupSharing(){
    try {
        qrcode.clear()
    } catch {
        //console.log("QRCode not initialized")
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
    //console.log("Attempting to start sharing")
    if (isExtension) chrome.runtime.sendMessage({origin:"webapp", payload:"start-sharing", data:data_to_send})
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
    if (isExtension) chrome.runtime.sendMessage({origin:"webapp", payload:"disable-sharing"})

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