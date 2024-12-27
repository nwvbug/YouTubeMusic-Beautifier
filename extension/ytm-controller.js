
const playerBar = document.querySelector("ytmusic-player-bar");
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

function getNowPlaying() {
  const outer = playerBar.querySelector(
    "yt-formatted-string.byline.ytmusic-player-bar.complex-string",
  );
  if (!outer) return null;
  const thumbnail = playerBar.querySelector("img.ytmusic-player-bar").src;
  const title = playerBar.querySelector(
    "yt-formatted-string.title.ytmusic-player-bar",
  ).innerHTML;
  const items = outer.querySelectorAll(
    "a.yt-simple-endpoint.yt-formatted-string",
  );
  const artist = items.item(0).innerHTML;
  const album = items.item(1).innerHTML;

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
  var playPause = "paused"
  try {
    play = document.querySelector('[title="Play"]')
    if (play == undefined){
      playPause = "playing"
    }
  } catch {
    console.log("unable to determine status of playpause")
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
    playPause
  };
}


const observer = new MutationObserver(collectCurrentSongData);

observer.observe(playerBar, {
  childList: true,
  subtree: true,
  attributes: true,
});

console.log("[YouTube Music] Started Observer!");


function collectCurrentSongData(){
  let data = getNowPlaying();
  console.log(data)
  chrome.runtime.sendMessage({ action: 'sendData', data: data }).then(response => {
    console.log('Response from background:', response); 
  })
  .catch(error => {
    console.error('Error sending message:', error); 
  });
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
    document.querySelector('[title="Previous"]').click()

  } catch{
    console.log("Back failed")
  }
}

function triggerNext(){
  try{
    document.querySelector('[title="Next"]').click()

  } catch{
    console.log("Next failed")
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
      triggerBack()
  }
  else if (request.action === 'next-from-middleman-ytm') {
    console.log("next IDENTIFIED")
      sendResponse("going next")
      triggerNext()
  }
});