var current_song;
var totalDuration
var lyrics = []
var tim = []
var showLyrics = true;

function onUpdate(data){
    console.log("ONUpdate")
    updateTimestamp(data.elapsed_time, data.total_time)
    if (current_song == data.song_identifier){
        displayLyricOneAtATime(data.elapsed_time)
        //just do lyrics / time update
    } else { //new song
        console.log("New Song")
        current_song = data.song_identifier
        hideLyricsView()
        hideBackground()
        setTimeout(() => {
          showBackground()
          if (showLyrics){
            showLyricsView()
          }
        }, 1000);
        console.log("song id: "+data.song_identifier)
        document.getElementById("title").innerText = data.song_name;
        document.getElementById("artist-album").innerText = data.song_artist + " • " + data.song_album
        document.getElementById("album-image").src = data.album_art;
        document.title = data.song_name + " | YTM-B"

        lyrics = data.lyrics_bank
        tim = data.times_bank
        initializeLyrics()
        displayLyricOneAtATime(data.elapsed_time)

    }
    
}

function initializeLyrics(){
    document.getElementById("lyric-holder").style.maxWidth = ""
    document.getElementById("lyric-holder").innerHTML = ""
    
    let totalhtml = ""
    for (let i = 0; i<7; i++){ //invis elements to push down first lines to center
        let html = `<div></div>`
        totalhtml+=(html)
    }
    for (let i = 0; i<lyrics.length; i++){
        let html = `<div id=${i} style="cursor:pointer;">${lyrics[i]}</div>`
        totalhtml+=(html)
    }
    for (let i = 0; i<7; i++){ //invis elements to push up last lines to center
        let html = `<div></div>`
        totalhtml+=(html)
    }
    document.getElementById("lyric-holder").innerHTML=totalhtml;

    for (let item of document.getElementById("lyric-holder").children){
        if (item.id != null && item.id != undefined){
            try {
                item.onclick = function(){selectNewLyric(parseInt(item.id))}
            } catch {

            }
            
        }
    }

    //document.getElementById("lyric-holder").style.maxWidth = document.getElementById("lyric-holder").offsetWidth
    current_index = 0;
    current_time = -1;
    document.getElementById("lyric-holder").scrollTo(0,0)
}


function selectNewLyric(i){
    console.log("attempting to select lyric "+i)
    console.log("IMPLEMENT THIS")
}

function displayLyricOneAtATime(seconds, identifier=null){
    if (seconds < current_time){
        //document.getElementById("lyric-holder").scrollTo(0,0)
        let lyric_list = document.getElementById("lyric-holder").children
        for (let item of lyric_list){
            if (item.id != null && item.id != undefined){
                try {
                    resetLyric(item.id)
                } catch {

                }
                
            }
            
        }
        current_index = 0;
        for (let i = 0; i<tim.length; i++){
            if (seconds >= tim[i]){
                current_index = i;
                highlightLyric(current_index)
                break;
            }
        }
    }
    current_time = seconds;
    
    if (seconds >= tim[current_index]){
        highlightLyric(current_index)
        if (current_index-1 >= 0){
            resetLyric(current_index-1)
        }
        current_index++;

        if (seconds >= tim[current_index]){
            while(seconds >= tim[current_index]){
                if (current_index > 0){
                    resetLyric(current_index-1)
                } 
                current_index++;
            }
            highlightLyric(current_index-1)
            
        }
    } else {

    }
}

function hideLyricsView(){
    document.getElementById("lyrics-flex").style.maxWidth = "0vw"
    document.getElementById("lyrics-flex").style.opacity = "0"
    document.getElementById("time").style.opacity = "0"
    document.getElementById("time").style.pointerEvents = "none"
    document.getElementById("main-body").style.gap = "0"
}

function showLyricsView(){
    document.getElementById("lyrics-flex").style.maxWidth = "50vw"
    document.getElementById("lyrics-flex").style.opacity = "1"
    document.getElementById("main-body").style.gap = "100px"
    // if (lyric_source == "unofficial"){
    //     document.getElementById("time").style.opacity = "1"
    //     document.getElementById("time").style.pointerEvents = "all"
    // }
}

function hideBackground(){
    document.getElementById("canvas-hider").style.opacity = "1"
}

function showBackground(){
    document.getElementById("canvas-hider").style.opacity = "0"
}


function highlightLyric(lyric_id){
    document.getElementById(lyric_id).style.fontSize = "40px"
    document.getElementById(lyric_id).style.width = "100%"
    document.getElementById(lyric_id).style.opacity = 1
    document.getElementById(lyric_id).style.fontWeight = 800;
    document.getElementById(lyric_id).scrollIntoView(scrollIntoViewOptions={"block":"center", "behavior":"smooth"})

}

function resetLyric(lyric_id){
    document.getElementById(lyric_id).style.opacity = 0.4;
    document.getElementById(lyric_id).style.width = "80%"
    document.getElementById(lyric_id).style.fontSize = "32px"
    document.getElementById(lyric_id).style.fontWeight = 500;

}

function updateTimestamp(elapsed, total){
    document.getElementById("progressbar").style.width = ((elapsed / total)  *100)+"%";
}