const playerBar = document.querySelector("ytmusic-player-bar");
const queue_element = document.getElementById("queue").querySelector("#contents")
var currently_playing_song;
var previously_playing_song;

// NEW Global state from time bridge
let lastKnownPreciseTime = 0;
let isPlayerPaused = true;

function activate(){
  playerBar = document.querySelector("ytmusic-player-bar");
  console.log(playerBar)
  let np = getNowPlaying()
  console.log(np)
}
function timestampToSeconds(timestamp) {
  const [minutes, seconds] = timestamp.split(":").map((x) => parseInt(x, 10));
  return minutes * 60 + seconds;
}
function format(str){
  str = str.replaceAll("&amp;", "&")
  str = str.replaceAll("&nbsp;", " ")
  return str
}
function getNowPlaying() {
  const outer = playerBar.querySelector(
    "yt-formatted-string.byline.ytmusic-player-bar.complex-string",
  );
  if (!outer) return null;
  const thumbnail = playerBar.querySelector("img.ytmusic-player-bar").src;
  const title = format(playerBar.querySelector(
    "yt-formatted-string.title.ytmusic-player-bar",
  ).innerHTML);
  let str = ""
  const items = document.querySelector('.byline.style-scope.ytmusic-player-bar.complex-string').children
  for (let elem of items){str+=elem.innerText}
  str = str.split("•")
  artist = format(str[0])
  album = format(str[1])
  date = format(str[2])
  
  const leftControls = playerBar.querySelector(
    ".left-controls",
  );
  
  // Use a value from the time bridge instead of querying DOM
  const playPauseState = isPlayerPaused ? "Play" : "Pause";

  const [_, totalFromDOM] = leftControls.querySelector(
    "span.time-info.ytmusic-player-bar",
  )
    .innerHTML.trim().split(" / ");
  
  
  const listItem = document.querySelector(
    `ytmusic-responsive-list-item-renderer.ytmusic-playlist-shelf-renderer[play-button-state="playing"]`,
  ) || document.querySelector(
    `ytmusic-responsive-list-item-renderer.ytmusic-playlist-shelf-renderer[play-button-state="paused"]`,
  );
  var large_image = null
  try{
    // Scope to the player: unscoped "#thumbnail" can match a browse-page item.
    // yt-img-shadow holds a 1x1 transparent data: GIF until lazy-loading finishes.
    const playerThumb = document.querySelector("ytmusic-player #thumbnail img")
      || document.querySelector("#thumbnail").children[0];
    if (playerThumb && playerThumb.src && !playerThumb.src.startsWith("data:")) {
      large_image = playerThumb.src;
    }
  } catch{
    console.log("Image not grabbable")
  }
  if (!large_image && thumbnail && !thumbnail.startsWith("data:")) {
    // Fall back to the player-bar thumbnail at album-art resolution
    large_image = thumbnail.replace(/=w\d+-h\d+/, "=w544-h544");
  }
  
  let url;
  
  if (listItem) {
    const el = listItem.querySelector(
      "yt-formatted-string.title.ytmusic-responsive-list-item-renderer",
    );
    if (el) {
      const a = el.querySelector("a");
      if (a) {
        url = a.href;
      }
    }
  }
  
  if (currently_playing_song == title+artist+album){
      // nothing extra to do, song is playing still
  } else {
      currently_playing_song = title+artist+album;
  }
  
  return {
    thumbnail,
    title,
    artist,
    album,
    // Use time from bridge for the final calculation
    currentTime: lastKnownPreciseTime,
    syncTimestamp: Date.now(),
    total: timestampToSeconds(totalFromDOM),
    url,
    large_image,
    playPauseState, // This is the new derived one
    date
  };
}

let debounced = true
const playBarObserver = new MutationObserver(checkForNewSong);

playBarObserver.observe(playerBar, {
  childList: true,
  subtree: true,
  attributes: true,
});

// const queueObserver = new MutationObserver(getQueue);

// queueObserver.observe(queue_element, {
//   childList: true,
//   subtree: true,
//   attributes: true,
// });

console.log("[YouTube Music] Started YTMusic Fullscreen Background Process!");
var pollingInterval = 5000;
var pollTimer;
let speedUpTimeout;

function poll() {
   collectCurrentSongData();
   pollTimer = setTimeout(poll, pollingInterval);
}
poll();

function speedUpPolling() {
    // If a timeout to slow down is already scheduled, clear it.
    if (speedUpTimeout) {
        clearTimeout(speedUpTimeout);
    }

    // If we're already polling fast, we don't need to change the interval.
    if (pollingInterval !== 500) {
        clearTimeout(pollTimer);
        pollingInterval = 500;
        poll(); // Poll immediately at the new rate.
    }
    
    // Schedule the return to slow polling.
    speedUpTimeout = setTimeout(() => {
        clearTimeout(pollTimer);
        pollingInterval = 5000;
        poll();
        speedUpTimeout = null;
    }, 10000);
}

function checkForNewSong(){
    let np = getNowPlaying()
    if (np != null){
        if (np.title+np.artist+np.album != previously_playing_song){
            previously_playing_song = np.title+np.artist+np.album
            speedUpPolling();
        }
    }
    
}

function collectCurrentSongData(){
  if (debounced){
    let data = getNowPlaying();
    console.log(data)
    chrome.runtime.sendMessage({ type: 'YTM_DATA_UPDATE', payload: data }).then(response => {
      console.log('Response from background:', response); 
    })
    .catch(error => {
      console.error('Error sending message:', error); 
    });
    debounced = false
    setTimeout(() => {
      debounced = true
    }, 150);
  }
  
}
function triggerPause(){
  try {
    document.getElementById("play-pause-button").click();
  } catch{
    console.log("Pause failed")
  }
}
function triggerBack(){
  try{
    document.querySelector(".previous-button.style-scope.ytmusic-player-bar").click()
  } catch{
    console.log("Back failed")
  }
}
function triggerNext(){
  try{
    document.querySelector(".next-button.style-scope.ytmusic-player-bar").click()
  } catch{
    console.error("Next failed")
  }
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("MESSAGE HEARD", request)
  switch (request.type) {
    case 'YTM_CONTROL_PLAY_PAUSE':
      console.log("PAUSE IDENTIFIED")
      sendResponse("pausing")
      triggerPause()
      break;
    case 'YTM_CONTROL_PREVIOUS':
      console.log("BACK IDENTIFIED")
      sendResponse("going prev")
      pressShiftP()
      break;
    case 'YTM_CONTROL_NEXT':
      console.log("NEXT IDENTIFIED")
      sendResponse("going next")
      pressShiftN()
      break;
    case 'YTM_REQUEST_QUEUE_UPDATE':
      sendResponse("sending queue update")
      getQueue();
      break;
    case 'YTM_REQUEST_SONG_DATA_UPDATE':
      sendResponse("sending song update")
      collectCurrentSongData();
      break;
    case 'YTM_CONTROL_SCAN_TO':
      sendResponse("scanning to "+request.payload.time)
      scan(request.payload.time);
      break;
    case 'YTM_SPEED_UP_POLLING':
        speedUpPolling();
        break;
  }
});
function pressShiftP() {
  const eventKeyDown = new KeyboardEvent('keydown', {
    key: 'P',
    code: 'KeyP',
    shiftKey: true,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true,
    view: window,
  });
  document.dispatchEvent(eventKeyDown);
  const eventKeyUp = new KeyboardEvent('keyup', {
    key: 'P',
    code: 'KeyP',
    shiftKey: true,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true,
    view: window,
  });
  document.dispatchEvent(eventKeyUp);
}
function pressShiftN() {
  const eventKeyDown = new KeyboardEvent('keydown', {
    key: 'N',
    code: 'KeyN',
    shiftKey: true,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true,
    view: window,
  });
  document.dispatchEvent(eventKeyDown);
  const eventKeyUp = new KeyboardEvent('keyup', {
    key: 'N',
    code: 'KeyN',
    shiftKey: true,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true,
    view: window,
  });
  document.dispatchEvent(eventKeyUp);
}
function getQueue(){
  //document.getElementById("queue").querySelector("#contents").children[5].querySelector("#primary-renderer").querySelector("ytmusic-player-queue-item").children[1].querySelector("ytmusic-item-thumbnail-overlay-renderer").getAttribute("play-button-state")
  let currently_playing_index = 0;
  let queue_items = queue_element.children;
  let queue_data = []
  for (let i = 0; i<queue_items.length; i++){
    let queue_entry = queue_items[i];
    let ytmusic_queue_item = queue_entry;
    if (ytmusic_queue_item.nodeName != "YTMUSIC-PLAYER-QUEUE-ITEM"){
      ytmusic_queue_item = queue_entry.querySelector("ytmusic-player-queue-item")
    }
    if (ytmusic_queue_item == null){
      console.log("javer script")
    } else {
      let state = ytmusic_queue_item.children[1].querySelector("ytmusic-item-thumbnail-overlay-renderer").getAttribute("play-button-state")
    
      if (state != "default"){
        console.log("state was not default: "+state)
        currently_playing_index = i;
      }
      let rfr = ytmusic_queue_item
      if (rfr.nodeName != "YTMUSIC-PLAYER-QUEUE-ITEM"){
        rfr = rfr.querySelector("ytmusic-player-queue-item")
      }
      let queue_entry = {"name":rfr.children[2].children[0].innerText, "artist":rfr.children[2].children[1].innerText, "image":rfr.children[1].children[0].children[0].src}
      queue_data.push(queue_entry)
    }
    
  }
  let previous = null;
  let next = null;
  if (currently_playing_index > 0){
    let rfr = queue_element.children[currently_playing_index-1]
    if (rfr.nodeName != "YTMUSIC-PLAYER-QUEUE-ITEM"){
      rfr = rfr.querySelector("ytmusic-player-queue-item")
    }
    previous = {"name":rfr.children[2].children[0].innerText, "artist":rfr.children[2].children[1].innerText, "image":rfr.children[1].children[0].children[0].src}
  }
  if (currently_playing_index < queue_items.length-1){
    let rfr = queue_element.children[currently_playing_index+1]
    if (rfr.nodeName != "YTMUSIC-PLAYER-QUEUE-ITEM"){
      rfr = rfr.querySelector("ytmusic-player-queue-item")
    }
    next = {"name":rfr.children[2].children[0].innerText, "artist":rfr.children[2].children[1].innerText, "image":rfr.children[1].children[0].children[0].src}
  }
  console.log(previous, next)
  let queue = {
    "position_in_queue":currently_playing_index,
    "next":next,
    "previous":previous,
    "queue_data":queue_data
  }
  chrome.runtime.sendMessage({ type: 'YTM_QUEUE_UPDATE', payload: queue }).then(response => {
    console.log('Response from background:', response); 
  })
  .catch(error => {
    console.error('Error sending message:', error); 
  });
}
function scan(seconds){
  if (seconds < 0){
    seconds = -seconds;
    for (let i = 0; i<seconds; i++){
      triggerBack()
    }
  } else {
    for (let i = 0; i<seconds; i++){
      triggerNext()
    }
  }
  speedUpPolling();
}
function triggerNext() {
  const event = new KeyboardEvent('keydown', {
    key: 'L',
    code: 'KeyL',
    shiftKey: true,
    ctrlKey: false,
    altKey: false,
    metaKey: false, // For Mac Command key
    bubbles: true,
    cancelable: true,
    view: window,
  });
  document.dispatchEvent(event);
  const eventUp = new KeyboardEvent('keyup', {
    key: 'L',
    code: 'KeyL',
    shiftKey: true,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true,
    view: window,
  });
  document.dispatchEvent(eventUp);
}
function triggerBack() {
  const event = new KeyboardEvent('keydown', {
    key: 'H',
    code: 'KeyH',
    shiftKey: true,
    ctrlKey: false,
    altKey: false,
    metaKey: false, // For Mac Command key
    bubbles: true,
    cancelable: true,
    view: window,
  });
  document.dispatchEvent(event);
  const eventUp = new KeyboardEvent('keyup', {
    key: 'H',
    code: 'KeyH',
    shiftKey: true,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true,
    view: window,
  });
  document.dispatchEvent(eventUp);
}

window.addEventListener('blur', () => {
 console.log('YTM unfocused');
    chrome.runtime.sendMessage({ type: 'YTM_TAB_UNFOCUSED' });
});
window.addEventListener('focus', () => {
 console.log('YTM focused');
    chrome.runtime.sendMessage({ type: 'YTM_TAB_FOCUSED' });
});
let messageDispatched = false
function addLaunchWebAppButton() {
    if (document.getElementById('launch-beautifier-webapp')) {
        return; // Button already exists
    }
    const rightControls = document.querySelector('.right-controls-buttons');
    if (rightControls) {
        const webAppButton = document.createElement('yt-icon-button');
        webAppButton.id = 'launch-beautifier-webapp';
        webAppButton.className = 'style-scope ytmusic-player-bar';
        webAppButton.title = 'Launch YouTube Music Beautifier';
        const img = document.createElement('img');
        img.src = chrome.runtime.getURL('assets/nobackground.png');
        img.style.width = '24px';
        img.style.height = '24px';
        img.style.opacity = '0.5';
        img.style.boxSizing = 'border-box';
        img.style.borderRadius = '50%';
        webAppButton.appendChild(img);
        webAppButton.addEventListener('click', () => {
            chrome.runtime.sendMessage({ type: 'OPEN_WEBAPP' });
        });
        rightControls.appendChild(webAppButton);
    }
}
setInterval(() => {
  addLaunchWebAppButton();
  if (!messageDispatched){
    try {
      let traditionalLyricHolder = document.querySelector("ytmusic-description-shelf-renderer .non-expandable.description")
      let disclaimer = document.createElement("div")
      disclaimer.innerText = "To use the YouTube Music Beautifier and view synced lyrics, launch the extension from your Extensions menu (puzzle piece icon)."
      disclaimer.style.fontSize = "15px"
      disclaimer.style.marginBottom = "10px"
      disclaimer.style.opacity = "0.7"
      disclaimer.style.textAlign = "center"
      disclaimer.style.padding = "0 10px"
      traditionalLyricHolder.prepend(disclaimer)
      messageDispatched = true
    } catch {
    }
  }
}, 1000)
function addVideoEventListeners() {
    const video = document.querySelector('video');
    if (video) {
        const sendSyncUpdate = () => {
            // This function is already debounced, so it's safe to call it.
            collectCurrentSongData();
        };

        video.addEventListener('play', sendSyncUpdate);
        video.addEventListener('pause', sendSyncUpdate);
        video.addEventListener('seeked', sendSyncUpdate);
    } else {
        // If video is not found, try again in a second.
        setTimeout(addVideoEventListeners, 1000);
    }
}
addVideoEventListeners();
window.addEventListener('click', speedUpPolling);


function injectTimeBridge() {
    const script = document.createElement('script');
    
    // Get the absolute chrome-extension:// URL for our bridge file
    script.src = chrome.runtime.getURL('ytm-injected-timer.js');
    
    // Clean up the DOM node after the script executes
    script.onload = function() {
        this.remove(); 
    };
    
    // Append to head or document element
    (document.head || document.documentElement).appendChild(script);
}

injectTimeBridge();

window.addEventListener('message', (event) => {
  console.log("Message received in controller:", event.data);
    // Security check: ensure it's from our own window and is our specific message
    if (event.source !== window || event.data.type !== 'YTM_INTERNAL_TIME') return;

    // This is the exact, lag-free time of the current song
    lastKnownPreciseTime = event.data.currentTime; 
    isPlayerPaused = event.data.isPaused;
});
