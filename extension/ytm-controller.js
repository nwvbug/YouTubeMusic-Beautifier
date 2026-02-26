
const playerBar = document.querySelector("ytmusic-player-bar");
const queue_element = document.getElementById("queue").querySelector("#contents")
var currently_playing_song;

// Guard against "Extension context invalidated" after extension reload/update
function isExtensionContextValid() {
  try {
    return !!chrome.runtime.id;
  } catch {
    return false;
  }
}

function safeSendMessage(msg) {
  if (!isExtensionContextValid()) {
    cleanupOnInvalidContext();
    return Promise.resolve();
  }
  return chrome.runtime.sendMessage(msg);
}

function cleanupOnInvalidContext() {
  playBarObserver.disconnect();
  queueObserver.disconnect();
  if (disclaimerIntervalId) clearInterval(disclaimerIntervalId);
  console.log("[YouTube Music] Extension context invalidated. Observers disconnected.");
}

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
  const playPauseButton = leftControls.querySelector("#play-pause-button");
  const isPlaying = !(document.querySelector('video')?.paused);
  const [elapsed, total] = leftControls.querySelector(
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
    large_image = document.querySelector("#thumbnail").children[0].src
  } catch{
    console.log("Image not grabbable")
  }
  var playPauseState = document.querySelector('video')?.paused ? "Play" : "Pause"

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
    currently_playing_song = title+artist+album
    getQueue()
  }

  return {
    thumbnail,
    title,
    artist,
    album,
    isPlaying,
    elapsed: timestampToSeconds(elapsed),
    total: timestampToSeconds(total),
    url,
    large_image,
    playPauseState,
    isPlaying,
    date
  };
}




const playBarObserver = new MutationObserver(collectCurrentSongData);

playBarObserver.observe(playerBar, {
  childList: true,
  subtree: true,
  attributes: true,
});

const queueObserver = new MutationObserver(getQueue);

queueObserver.observe(queue_element, {
  childList: true,
  subtree: true,
  attributes: true,
});

console.log("[YouTube Music] Started YTMusic Fullscreen Background Process!");


let debounced = true
function collectCurrentSongData(){
  if (debounced){
    let data = getNowPlaying();
    console.log(data)
    safeSendMessage({origin:"ytm",payload:{ action: 'sendData', data: data }}).then(response => {
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
  console.log("MESSAGE HEARD")
  if (request.action === 'pause-from-middleman-ytm') {
    console.log("PAUSE IDENTIFIED")
      sendResponse("pausing")
      triggerPause()
  }
  else if (request.action === 'back-from-middleman-ytm') {
    console.log("BACK IDENTIFIED")
      sendResponse("going prev")
      pressShiftP()
  }
  else if (request.action === 'next-from-middleman-ytm') {
    console.log("next IDENTIFIED")
      sendResponse("going next")
      pressShiftN()
  } else if (request.action === 'ytm-request-queue-update'){
    sendResponse("sending queue update")
    getQueue();
  } else if (request.action === 'ytm-request-song-data-update'){
    sendResponse("sending song update")
    collectCurrentSongData();
  } else if (request.action === 'ytm-scan-to'){
    sendResponse("scanning to "+request.data.time)
    scan(request.data.time);
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
  safeSendMessage({origin:"ytm",payload:{ action: 'sendQueue', data: queue }}).then(response => {
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
    safeSendMessage({origin:"ytm",payload:{ action: 'TAB_UNFOCUSED', tabInfo: { url: window.location.href, visibilityState: document.visibilityState } }});
});

window.addEventListener('focus', () => {
 console.log('YTM focused');
    safeSendMessage({origin:"ytm",payload:{ action: 'TAB_FOCUSED', tabInfo: { url: window.location.href, visibilityState: document.visibilityState } }});
});


let messageDispatched = false

var disclaimerIntervalId = setInterval(() => {
  if (!messageDispatched){
    try {
      let traditionalLyricHolder = document.querySelector("#contents > ytmusic-description-shelf-renderer > span")
      let disclaimer = document.createElement("div")
      disclaimer.innerText = "To use the YouTube Music Beautifier and view synced lyrics, launch the extension from your Extensions menu (puzzle piece icon)."
      disclaimer.style.fontSize = "15px"
      disclaimer.style.marginTop = "10px"
      disclaimer.style.opacity = "0.7"
      disclaimer.style.textAlign = "center"
      disclaimer.style.padding = "0 10px"
      traditionalLyricHolder.appendChild(disclaimer)
      messageDispatched = true
    } catch {

    }
  }
}, 1000)


// --- Floating "Open Beautifier" Button ---
;(function injectFloatingButton() {
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;

  const fab = document.createElement('div');
  fab.id = 'ytmb-fab';
  fab.title = 'Open Beautifier';
  fab.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 244 243" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M219.411 94.3951H231.3C237.785 94.3951 243.189 99.7891 244 106.262V136.468C244 142.941 238.596 148.335 232.111 148.335H220.221C218.06 156.696 214.817 164.247 210.764 171.529L219.141 179.89C223.734 184.475 223.734 192.027 219.141 196.612L197.524 218.188C192.93 222.772 185.364 222.772 180.771 218.188L172.394 209.827C165.099 213.872 157.262 217.109 149.156 219.266V231.133C149.156 237.606 143.752 243 137.267 243H106.733C100.248 243 94.8439 237.606 94.8439 231.133V219.266C86.4673 217.109 78.9014 213.872 71.6058 209.827L63.2292 218.188C58.6357 222.772 51.0698 222.772 46.4762 218.188L24.8594 196.612C20.2658 192.027 20.2658 184.475 24.8594 179.89L33.2359 171.529C29.1827 164.247 25.9402 156.426 23.7785 148.335H11.8893C5.134 148.335 0 142.941 0 136.738V106.262C0 99.7891 5.134 94.3951 11.8893 94.6648H23.5083C25.67 86.3041 28.9125 78.7525 32.9657 71.4706L24.5892 63.1099C19.9955 58.525 19.9955 50.9734 24.5892 46.3884L46.206 24.8124C50.7996 20.2275 58.3654 20.2275 62.959 24.8124L71.3356 33.1732C78.6312 29.1276 86.4673 25.8912 94.5737 23.7336V11.8668C94.5737 5.39398 99.7076 0 106.463 0H136.726C143.211 0 148.616 5.39398 148.346 11.8668V23.4639C156.722 25.6215 164.288 28.8579 171.584 32.9034L179.96 24.5427C184.554 19.9578 192.12 19.9578 196.713 24.5427L218.33 46.1188C222.924 50.7037 222.924 58.2552 218.33 62.8401L209.953 71.2009C214.007 78.4828 217.249 86.3041 219.411 94.3951ZM122 188C159.003 188 189 158.003 189 121C189 83.9969 159.003 54 122 54C84.9969 54 55 83.9969 55 121C55 158.003 84.9969 188 122 188Z" fill="white"/>
    </svg>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #ytmb-fab {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(8px);
      display: ${isPWA ? 'flex' : 'none'};
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 9999;
      transition: background 0.2s, transform 0.2s, opacity 0.2s;
      opacity: 0.6;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      user-select: none;
    }
    #ytmb-fab:hover {
      background: rgba(255, 255, 255, 0.3);
      opacity: 1;
      transform: scale(1.1);
    }
    #ytmb-fab:active {
      transform: scale(0.95);
    }
    #ytmb-fab svg {
      width: 24px;
      height: 24px;
      pointer-events: none;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(fab);

  // Click handler — request service worker to open webapp
  fab.addEventListener('click', (e) => {
    if (fab.dataset.dragged === 'true') return;
    safeSendMessage({ origin: 'ytm', payload: { action: 'open-webapp' } })
      .catch(err => console.error('Failed to open Beautifier:', err));
  });

  // Draggable behavior
  let isDragging = false;
  let startX, startY, origX, origY;

  fab.addEventListener('pointerdown', (e) => {
    isDragging = false;
    fab.dataset.dragged = 'false';
    startX = e.clientX;
    startY = e.clientY;
    const rect = fab.getBoundingClientRect();
    origX = rect.left;
    origY = rect.top;
    fab.setPointerCapture(e.pointerId);
  });

  fab.addEventListener('pointermove', (e) => {
    if (startX === undefined) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      isDragging = true;
    }
    if (isDragging) {
      fab.style.right = 'auto';
      fab.style.bottom = 'auto';
      fab.style.left = (origX + dx) + 'px';
      fab.style.top = (origY + dy) + 'px';
    }
  });

  fab.addEventListener('pointerup', (e) => {
    if (isDragging) {
      fab.dataset.dragged = 'true';
    }
    startX = startY = undefined;
    isDragging = false;
  });

  // Toggle visibility with keyboard shortcut (Alt+B)
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key.toLowerCase() === 'b') {
      fab.style.display = fab.style.display === 'none' ? 'flex' : 'none';
    }
  });
})();