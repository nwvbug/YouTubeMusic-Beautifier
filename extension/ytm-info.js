
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
    large_image
  };
}


const observer = new MutationObserver(collectCurrentSongData);

observer.observe(playerBar, {
  childList: true,
  subtree: true,
  attributes: true,
});

console.log("[Discord Rich Presence] [YouTube Music] Started Observer!");


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