var contentId; //ID of origin YTM tab (to make sure messages are delivered when sent back)
var incomingSecondOffset = 0
var lyrics= []
var times = []
var lyrics_fresh = false
var allow_remote_control = true
var current_song_identifier = ""
var webapp_loaded = false
var searched_for_lyrics = false
var live
var current_album_art = undefined

//lyrics fresh and searched for lyrics explanation:
//lyrics fresh = do lyrics match current song
//searched for lyrics = did we try to find lyrics 
// lyrics fresh = true: show yes lyrics option
// lyrics not fresh, not searched: show searching option
// lyrics not fresh, searched: show no lyrics option

//const REST_URL = "http://127.0.0.1:7071" //Change if you have self-hosted lyrics server
//const REST_URL = "https://ytm.nwvbug.com"
const REST_URL = "https://ytmbeta.nwvbug.com"


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let origin = request.origin
    let payload = request.payload
    console.log("Middleman Recieved Message From: "+origin+" With payload of ")
    //console.log(payload)

    switch (origin){
        case "ytm":
            //Start YTM Origin Request Case
            contentId = sender.tab.id
            let action = payload.action
            if (action == "sendData"){
                console.log("Origin Update Recieved, sending data through")
                let data_to_send = parseYTMData(payload.data)
                sendToWebapp("sendParsedData", data_to_send)
                if (live){
                    sendToOffscreen(data_to_send)
                }
            } else if (action == "sendQueue"){
                console.log("Defunct Message, Ignoring")
            } else if (action=="TAB_UNFOCUSED"){
                console.log("Unfocused Tab, sending thru")
            } else if (action=="TAB_FOCUSED"){
                console.log("Unfocused Tab, sending thru")
            } else {
                console.log("Unknown action intention, ignoring")
            }

            //End YTM Origin Request Case
            break

        case "webapp":
            //Webapp origin request case
            if (payload == "acknowledge"){
                console.log("Webapp hears updates, connected")
                webapp_loaded = true
            } else if (payload == "ytm-pause"){
                console.log("Webapp requests pause / play")
                requestPausePlay()
            } else if (payload == "ytm-back"){
                console.log("Webapp requests back")
                requestPrevious()
            } else if (payload == "ytm-next"){
                console.log("Webapp requests next")
                requestNext()
            } else if (payload == "ytm-scan-to"){
                console.log("webapp requests scanto")
                requestScanTo(request.data)
            } 
            
            else if (payload == "start-sharing"){
                console.log("STARTING SHARING")
                createOffscreenDocument()
                allow_remote_control = request.data.allow_remote_control
            } else if (payload == "kick_connected_user"){
                let user_id = request.data.user_id
                chrome.runtime.sendMessage({destination:"offscreen", payload:"kick_user", user_id:user_id})
            } else if (payload == "disable-sharing"){
                live = false
                chrome.runtime.sendMessage({destination:"offscreen", payload:"disable_sharing"})
            }
            //end webapp origin request case
            break

        case "offscreen":
            //offscreen (socket) origin request case
            let intents = request.payload.event
            if (intents == "room_created"){
                live = true
                chrome.runtime.sendMessage({origin:"middleman", action:"room_created", payload:request.payload.data})
            } else if (intents == "client_disconnected"){
                chrome.runtime.sendMessage({origin:"middleman", action:"client_disconnected", payload:request.payload.data})
            } else if (intents == "client_joined"){
                chrome.runtime.sendMessage({origin:"middleman", action:"client_joined", payload:request.payload.data})
            } else if (intents == "pause"){
                requestPausePlay()
            } else if (intents == "skip"){
                requestNext()
            } else if (intents == "prev"){
                requestPrevious()
            } else if (intents == "ready"){
                chrome.runtime.sendMessage({destination:"offscreen", payload:"start_sharing", remote:allow_remote_control})
            }
            //end offscreen origin request case
            break
        
        case "popup":
            //popup (on ytm page- when extension clicked) origin request case
            if (request.action=="request_image"){
                chrome.runtime.sendMessage({origin:"middleman", action:"popup_image", payload:current_album_art})
            }
    }
});



//LYRICS FINDING AND PARSING

function getSongLyrics(title, artist, album){
  
  let url_addon = title+" "+artist
  url_addon = url_addon.replaceAll("/", "-")
  url_addon = url_addon.replaceAll("%", "%25")
  fetch(REST_URL+"/request-lyrics/"+url_addon).then(response => response.text()) // Change server in config.js
  .then(result => {
      // Handle the received text data
      console.log(result); 
      searched_for_lyrics = true
      if (result == "no_lyrics_found" || result.includes("<title>500 Internal Server Error</title>")){
        console.log("no lyrics")
        lyric_source = "none"
        lyrics_fresh = false
      } else {
        lyrics_fresh = true;
        result = JSON.parse(result)
        data = result["lrc"]
        console.log(data)
        if (result["source"] == "unofficial"){
          parseUnofficialLyrics(data)
        } else if (result["source"] == "ytm"){
          parseYTMLyrics(data)
        }
        if (times.length == 0){
            lyrics_fresh = false
        }
      }
      
  })
  .catch(error => {
      console.error('Error:', error);
  });
}


var lyric_source = "none";
var allTextLines = " ";

var line = " ";

function parseUnofficialLyrics(data){
    lyric_source = "unofficial"
    processData(data)
   
}

function parseYTMLyrics(data){
    lyric_source = "ytm"
    lyrics = []
    times = []
    for (let i = 0; i<data.length; i++){
        lyrics[i] = data[i].text
        times[i] = Math.floor(data[i].time)
    }
    
}

// parsing the Lyrics 
function processData(allText) { // This will only divide with respect to new lines 
    allTextLines = allText.split(/\r\n|\n/);
    lyrics = []
    times = []
    next();
} 

function next(){
    for (i=0;i<allTextLines.length;i++){
        if (allTextLines[i].search(/^(\[)(\d*)(:)(.*)(\])(.*)/i)>=0 ){// any line without the prescribed format wont enter this loop 
            line = allTextLines[i].match(/^(\[)(\d*)(:)(.*)(\])(.*)/i);
            times[i] = (parseInt(line[2])*60)+ parseInt(line[4]); // will give seconds 
            lyrics[i]= line[6] ;//will give lyrics 

        }
    }  
    for (i=0; i<lyrics.length; i++){
        if (lyrics[i] == " " || lyrics[i] == '' || lyrics[i].substring(1,3) == "作曲" || lyrics[i].substring(1,3) == "作词"){
            lyrics[i] = "♪♪"
        }
    }
    console.log(lyrics)
    console.log(times)
} 

// from https://stackoverflow.com/a/11690384



function parseYTMData(data){
    console.log("Parsing")
    console.log(data)
    current_album_art = data.large_image
    let incoming_id = data.title+data.artist+data.album
    if (incoming_id != current_song_identifier && webapp_loaded){
        console.log("New Song, checking for lyrics")
        lyrics_fresh = false
        searched_for_lyrics = false
        secondOffset = 0
        getSongLyrics(data.title, data.artist, data.album)
        current_song_identifier = incoming_id
        chrome.runtime.sendMessage({origin:"middleman", action:"popup_image", payload:current_album_art})
    }
    let data_to_send = {
        "song_name":data.title,
        "song_artist":data.artist,
        "song_album":data.album,
        "total_time":data.total,
        "elapsed_time":data.elapsed - incomingSecondOffset,
        "song_identifier":incoming_id,
        "pause_state":data.pause_state,
        "lyrics_bank":lyrics,
        "times_bank":times,
        "album_art":data.large_image,
        "lyric_freshness":lyrics_fresh,
        "allow_remote_control":allow_remote_control,
        "searched_for_lyrics":searched_for_lyrics
    }
    console.log(data_to_send)
    return data_to_send
}


function sendToWebapp(endpoint, data){
    chrome.runtime.sendMessage({origin:"middleman", action:endpoint, payload:data})
}

function subtractOffset(){
    incomingSecondOffset++;
    document.getElementById("offset").innerText = -1 * incomingSecondOffset
    saveOffset()
}

function addOffset(){
    incomingSecondOffset--;
    document.getElementById("offset").innerText = -1 * incomingSecondOffset
    saveOffset()
}   

function resetOffset(){
    chrome.storage.sync.get(current_song_identifier, (result) => {
        if (result != undefined && result[current_song_identifier] != undefined){
            incomingSecondOffset = result[current_song_identifier]
            document.getElementById("offset").innerText = -1 * result[current_song_identifier]
        } else {
            incomingSecondOffset = 0
            document.getElementById("offset").innerText = 0
        }
      });
    
}

function saveOffset(){
    chrome.storage.sync.set({ [current_song_identifier]: incomingSecondOffset }, () => {
        console.log(`Saved ${incomingSecondOffset} under key ${current_song_identifier}`);
      });
}






const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

// A function to create the offscreen document if it doesn't exist
async function createOffscreenDocument() {
    if (await chrome.offscreen.hasDocument()) {
        console.log("Offscreen document already exists.");
        return;
    }
    console.log("Creating offscreen document...");
    await chrome.offscreen.createDocument({
        url: OFFSCREEN_DOCUMENT_PATH,
        reasons: ['CLIPBOARD'], 
        justification: 'To maintain a persistent WebSocket connection for real-time updates.',
    }).then(() => {
        console.log("Offscreen Docu Created")
        
    })
}


function sendToOffscreen(update_data){
    chrome.runtime.sendMessage({destination:"offscreen", payload:"update", data:update_data})
}

// Authenticated functions: Use this for requests that are known to be good and want to complete

function requestScanTo(scanData){
        chrome.tabs.sendMessage(contentId, { action: 'ytm-scan-to', data: scanData }, (response) => {
            console.log("Response heard.")
        }); 
}

function requestNext(){
    chrome.tabs.sendMessage(contentId, { action: 'next-from-middleman-ytm', data: null }, (response) => {
        console.log("Response heard.")
        console.log(response)
    }); 
}

function requestPrevious(){
    chrome.tabs.sendMessage(contentId, { action: 'back-from-middleman-ytm', data: null }, (response) => {
        console.log("Response heard.")
    }); 
}

function requestPausePlay(){
    chrome.tabs.sendMessage(contentId, { action: 'pause-from-middleman-ytm', data: null }, (response) => {
        console.log("Response heard.")
    }); 
}