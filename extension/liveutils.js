let client_count = 0

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

function clientDisconnected(client_id){
    client_count--;
    document.getElementById("devices_connected").innerText = "You have "+client_count+" devices connected."
    document.getElementById("device-"+client_id).remove()
}

function clientJoined(client_data){
    client_count++;
    document.getElementById("devices_connected").innerText = "You have "+client_count+" devices connected."
    document.getElementById("connected_device_list").innerHTML += `
    <div class="source-entry" style="width:100%; display:flex; flex-direction: row; align-items: center; justify-content: space-between;" id="device-${data["client_internal_id"]}">
        <div class="source-name">
            <p style="font-size:18px;">${client_data["client_os"]}</p>  
        </div>
        <div class="generic-button" style="background-color: red; color:white; border-radius:10px; padding:10px; cursor:pointer; font-size:15px; font-weight:bold;" id="kickbutton-${data["client_internal_id"]}">
            Kick
        </div>
    </div>`
    document.getElementById("kickbutton-"+client_data["client_internal_id"]).onclick = function(){
        chrome.runtime.sendMessage({origin:"webapp", payload:"kick_connected_user", data:{user_id:client_data["client_internal_id"]}})
    }
}

var qrcode
function setupSharing(){
    let data_to_send = {
        "allow_remote_control":document.getElementById("remote-control-check").checked
    }
    console.log("Attempting to start sharing")
    chrome.runtime.sendMessage({origin:"webapp", payload:"start-sharing", data:data_to_send})
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
    chrome.runtime.sendMessage({origin:"webapp", payload:"disable-sharing"})
}