var ytmTabId; //ID of origin YTM tab (to make sure messages are delivered when sent back)
var webappTabId; //id of webapp (to watch for closure and stop background processes when closed)
var webapp_loaded = false
let unacknowledged = 0

var incomingSecondOffset = 0
var lyrics= []
var lyrics_code;
var times = []
var lyrics_fresh = false
var searched_for_lyrics = false
var current_song_identifier = ""

var allow_remote_control = true
var live = false
var current_room_code = undefined;

var current_album_art = undefined
var current_song_title = undefined
var current_song_artist = undefined
var current_song_album = undefined
var current_song_year = undefined

var sendNewUpdate = true
var currentPauseState;

//lyrics fresh and searched for lyrics explanation:
//lyrics fresh = do lyrics match current song
//searched for lyrics = did we try to find lyrics 
// lyrics fresh = true: show yes lyrics option
// lyrics not fresh, not searched: show searching option
// lyrics not fresh, searched: show no lyrics option

//const REST_URL = "http://127.0.0.1:7071" //Change if you have self-hosted lyrics server
const REST_URL = "https://ytm.nwvbug.com"


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Middleman Recieved Message: ", message);

    switch (message.type) {
        // YTM Controller Messages
        case "YTM_DATA_UPDATE":
            if (!message.payload) return; // Add null guard here
            ytmTabId = sender.tab.id;
            let data_to_send = parseYTMData(message.payload);
            sendToWebapp("STATE_UPDATE", data_to_send);
            let isImportant = isUpdateImportant(data_to_send);
            if (live && sendNewUpdate) {
                sendToOffscreen({ type: "OFFSCREEN_UPDATE_DATA", payload: data_to_send });
                sendNewUpdate = false;
                setTimeout(() => {
                    sendNewUpdate = true;
                }, 200);
            } else if (live && isImportant) {
                sendToOffscreen({ type: "OFFSCREEN_UPDATE_DATA", payload: data_to_send });
            }
            break;
        case "YTM_QUEUE_UPDATE":
            console.log("Defunct Message, Ignoring");
            break;
        case "YTM_TAB_UNFOCUSED":
            sendToWebapp("YTM_TAB_UNFOCUSED");
            break;
        case "YTM_TAB_FOCUSED":
            sendToWebapp("YTM_TAB_FOCUSED");
            break;

        // Webapp Messages
        case "WEBAPP_ACKNOWLEDGE":
            webappTabId = sender.tab.id;
            console.log("Webapp hears updates, connected");
            webapp_loaded = true;
            unacknowledged = 0;
            break;
        case "WEBAPP_REQUEST_PLAY_PAUSE":
            requestPausePlay();
            break;
        case "WEBAPP_REQUEST_PREVIOUS":
            requestPrevious();
            break;
        case "WEBAPP_REQUEST_NEXT":
            requestNext();
            break;
        case "WEBAPP_REQUEST_SCAN_TO":
            requestScanTo(message.payload);
            break;
        case "WEBAPP_REQUEST_REROLL_LYRICS":
            getSongLyrics(current_song_title, current_song_artist, current_song_album, current_song_year, true);
            break;
        case "WEBAPP_OFFSET_UP":
            addOffset();
            break;
        case "WEBAPP_OFFSET_DOWN":
            subtractOffset();
            break;
        case "WEBAPP_START_SHARING":
            createOffscreenDocument();
            allow_remote_control = message.payload.allow_remote_control;
            break;
        case "WEBAPP_KICK_USER":
            sendToOffscreen({ type: "OFFSCREEN_KICK_USER", payload: { user_id: message.payload.user_id }});
            break;
        case "WEBAPP_DISABLE_SHARING":
            disableSharing();
            break;
        case "WEBAPP_SWAP_REMOTE_CONTROL":
            allow_remote_control = message.payload.allow_remote_control;
            break;
        case "OPEN_WEBAPP":
            if (webapp_loaded && webappTabId) {
                chrome.tabs.get(webappTabId, (tab) => {
                    if (chrome.runtime.lastError) {
                        // The tab doesn't exist, so create it.
                        chrome.tabs.create({ url: "webapp.html" });
                    } else {
                        // The tab exists, so focus it.
                        chrome.tabs.update(webappTabId, { active: true });
                        chrome.windows.update(tab.windowId, { focused: true });
                    }
                });
            } else {
                chrome.tabs.create({ url: "webapp.html" });
            }
            if (ytmTabId) {
                chrome.tabs.sendMessage(ytmTabId, { type: 'YTM_SPEED_UP_POLLING' });
            }
            break;

        // Offscreen (Socket) Messages
        case "REMOTE_ROOM_CREATED":
            live = true;
            current_room_code = message.payload;
            sendToWebapp("WEBAPP_ROOM_CREATED", message.payload);
            break;
        case "REMOTE_CLIENT_DISCONNECTED":
            sendToWebapp("WEBAPP_CLIENT_DISCONNECTED", message.payload);
            break;
        case "REMOTE_CLIENT_JOINED":
            sendToWebapp("WEBAPP_CLIENT_JOINED", message.payload);
            break;
        case "REMOTE_REQUEST_PLAY_PAUSE":
            requestPausePlay();
            break;
        case "REMOTE_REQUEST_NEXT":
            requestNext();
            break;
        case "REMOTE_REQUEST_PREVIOUS":
            requestPrevious();
            break;
        case "REMOTE_OFFSCREEN_READY":
            sendToOffscreen({ type: "OFFSCREEN_START_SHARING", payload: { remote: allow_remote_control }});
            break;
        case "REMOTE_OFFSCREEN_TERMINATED":
            chrome.offscreen.closeDocument();
            break;

        // Popup Messages
        case "POPUP_REQUEST_IMAGE":
            chrome.runtime.sendMessage({ type: "POPUP_IMAGE_UPDATE", payload: current_album_art });
            break;
    }
});


chrome.tabs.onRemoved.addListener((tabId, removeInfo) =>{
    if (tabId == webappTabId){
        console.log("User has terminated YTM:B Webapp. Shutting down active processes")
        webapp_loaded = false;
        if (live){
            disableSharing()
        }
    }
})

function disableSharing(){
    live = false
    sendToOffscreen({ type: "OFFSCREEN_DISABLE_SHARING" });
}


//LYRICS FINDING AND PARSING

function getSongLyrics(title, artist, album, year, reroll=false){
  searched_for_lyrics = true;
  resetOffset()
  let url_addon = ""
  if (!reroll){
    url_addon = title+" "+artist+" "+year
  } else {
    url_addon = title+" "+artist+" "+album+" "+year
  }
  url_addon = url_addon.replaceAll("/", "-")
  url_addon = url_addon.replaceAll("%", "%25")
  fetch(REST_URL+"/request-lyrics/"+url_addon).then(response => response.text()) // Change server in config.js
  .then(result => {
      // Handle the received text data
      console.log(result); 
      if (result == "no_lyrics_found" || result.includes("<title>500 Internal Server Error</title>")){
        console.log("no lyrics")
        lyric_source = "none"
        lyrics_fresh = false
      } else {
        lyrics_fresh = true;
        lyrics_code = crypto.randomUUID()
        result = JSON.parse(result)
        let data = result["lrc"]
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
    for (let i=0;i<allTextLines.length;i++){
        if (allTextLines[i].search(/^(\[)(\d*)(:)(.*)(\])(.*)/i)>=0 ){// any line without the prescribed format wont enter this loop 
            line = allTextLines[i].match(/^(\[)(\d*)(:)(.*)(\])(.*)/i);
            let time = (parseInt(line[2])*60)+ parseInt(line[4]); // will give seconds 
            let lyric = line[6] ;//will give lyrics 

            if (lyric === " " || lyric === '' || lyric.substring(1,3) === "作曲" || lyric.substring(1,3) === "作词"){
                lyric = "♪♪"
            }
            times.push(time);
            lyrics.push(lyric);
        }
    }  
    console.log(lyrics)
    console.log(times)
} 

// from https://stackoverflow.com/a/11690384



function parseYTMData(data){
    console.log("Parsing")
    console.log(data)

    // Decouple popup image update from webapp status
    const new_album_art = data.large_image;
    if (new_album_art && new_album_art !== current_album_art) {
        current_album_art = new_album_art;
        chrome.runtime.sendMessage({ type: "POPUP_IMAGE_UPDATE", payload: current_album_art });
    }

    current_song_album = data.album
    current_song_artist = data.artist
    current_song_title = data.title
    current_song_year = data.date
    let incoming_id = data.title+data.artist+data.album
    
    let is_new_song = (incoming_id != current_song_identifier);
    
    if (is_new_song) {
        current_song_identifier = incoming_id;
        lyrics_fresh = false; // Reset freshness for new song
        searched_for_lyrics = false;
    }

    // We should fetch if it's a new song, OR if we haven't searched for the current one yet.
    if (webapp_loaded && !searched_for_lyrics) {
        console.log("Checking for lyrics for song: " + data.title);
        getSongLyrics(data.title, data.artist, data.album, data.date);
    }

    let data_to_send = {
        "song_name":data.title,
        "song_artist":data.artist,
        "song_album":data.album,
        "total_time":data.total,
        "elapsed_time":data.elapsed - incomingSecondOffset,
        "song_identifier":incoming_id,
        "pause_state":data.playPauseState,
        "lyrics_bank":lyrics,
        "lyrics_code":lyrics_code,
        "times_bank":times,
        "album_art":data.large_image,
        "lyric_freshness":lyrics_fresh,
        "allow_remote_control":allow_remote_control,
        "searched_for_lyrics":searched_for_lyrics,
        "live":live,
        "room_code":current_room_code,
        "offset-for-display":incomingSecondOffset
    }
    console.log(data_to_send)
    return data_to_send
}

function isUpdateImportant(newData){
    if (newData.song_identifier != current_song_identifier){
        return true
    }
    if (newData.pause_state != currentPauseState){
        currentPauseState = newData.pause_state
        return true
    }
    return false
}


function sendToWebapp(type, payload){
    unacknowledged++;
    chrome.runtime.sendMessage({ type, payload })
}

function subtractOffset(){
    incomingSecondOffset++;
    //document.getElementById("offset").innerText = -1 * incomingSecondOffset
    saveOffset()
}

function addOffset(){
    incomingSecondOffset--;
    //document.getElementById("offset").innerText = -1 * incomingSecondOffset
    saveOffset()
}   

function resetOffset(){
    console.log("Resetting Offset")
    chrome.storage.sync.get(current_song_identifier, (result) => {
        if (result != undefined && result[current_song_identifier] != undefined){
            console.log("Found saved offset: "+result[current_song_identifier])
            incomingSecondOffset = result[current_song_identifier]
            //document.getElementById("offset").innerText = -1 * result[current_song_identifier]
        } else {
            console.log("No saved offset found, resetting to 0")
            incomingSecondOffset = 0
            //document.getElementById("offset").innerText = 0
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


function sendToOffscreen(message){
    chrome.runtime.sendMessage(message)
}

// Authenticated functions: Use this for requests that are known to be good and want to complete

function requestScanTo(scanData){
        chrome.tabs.sendMessage(ytmTabId, { type: 'YTM_CONTROL_SCAN_TO', payload: scanData }, (response) => {
            console.log("Response heard.")
        }); 
}

function requestNext(){
    chrome.tabs.sendMessage(ytmTabId, { type: 'YTM_CONTROL_NEXT' }, (response) => {
        console.log("Response heard.")
        console.log(response)
    }); 
}

function requestPrevious(){
    chrome.tabs.sendMessage(ytmTabId, { type: 'YTM_CONTROL_PREVIOUS' }, (response) => {
        console.log("Response heard.")
    }); 
}

function requestPausePlay(){
    chrome.tabs.sendMessage(ytmTabId, { type: 'YTM_CONTROL_PLAY_PAUSE' }, (response) => {
        console.log("Response heard.")
    }); 
}