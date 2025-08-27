
const playerBar = document.querySelector("ytmusic-player-bar");
const queue_element = document.getElementById("queue").querySelector("#contents")
var currently_playing_song;

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
  const isPlaying = playPauseButton.getAttribute("aria-label") === "Pause";
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
  var playPauseState = document.getElementById("play-pause-button").getAttribute("title")

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
    chrome.runtime.sendMessage({origin:"ytm",payload:{ action: 'sendData', data: data }}).then(response => {
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
  chrome.runtime.sendMessage({origin:"ytm",payload:{ action: 'sendQueue', data: queue }}).then(response => {
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
    chrome.runtime.sendMessage({origin:"ytm",payload:{ action: 'TAB_UNFOCUSED', tabInfo: { url: window.location.href, visibilityState: document.visibilityState } }});
});

window.addEventListener('focus', () => {
 console.log('YTM focused');
    chrome.runtime.sendMessage({origin:"ytm",payload:{ action: 'TAB_FOCUSED', tabInfo: { url: window.location.href, visibilityState: document.visibilityState } }});
});