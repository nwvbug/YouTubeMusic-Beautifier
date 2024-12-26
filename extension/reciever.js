var current_song;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'displayData') {
      // Use the received data
      //console.log(request.data); 

      let temp_current_song = request.data.title+request.data.artist+request.data.album
      console.log(temp_current_song)
      if (temp_current_song != current_song){
        console.log("New song!")
        current_song = temp_current_song;
        document.getElementById("title").innerText = request.data.title;
        document.getElementById("artist").innerText = request.data.artist;
        document.getElementById("album").innerText = request.data.album;
        if (request.data.large_image!= null){
          document.getElementById("image").src=request.data.large_image
          colorize(request.data.large_image)
        }
        console.log(request.data.elapsed, " | ", request.data.total, " | ", request.data.elapsed/request.data.total*100)
        getSongLyrics(request.data.title, request.data.artist, request.data.album)
        displayLyricOneAtATime(request.data.elapsed)
      } else {
        console.log(request.data.elapsed, " | ", request.data.total, " | ", request.data.elapsed/request.data.total*100)
        console.log("Still playing current song")
        displayLyricOneAtATime(request.data.elapsed)
      }


    }
  });

function getSongLyrics(title, artist, album){
  let url_addon = title+" "+album+" "+artist
  fetch("http://127.0.0.1:7070/request-lyrics/"+url_addon).then(response => response.text()) // Get the text content
  .then(data => {
      // Handle the received text data
      console.log(data); 
      processData(data)
      initializeLyrics()
  })
  .catch(error => {
      console.error('Error:', error);
  });
}