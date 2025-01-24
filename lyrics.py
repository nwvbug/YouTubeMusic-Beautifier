import syncedlyrics
from ytmusicapi import YTMusic

ytm = YTMusic()


iterator = 0
def get_lyrics_unofficial(query):
    lrc = syncedlyrics.search(query)
    if lrc is None:
        return None
    return {"source":"unofficial", "lrc":lrc}
    

def get_ytm_lyrics(incomingQuery):
    results = ytm.search(query=incomingQuery, filter="songs", ignore_spelling=True)
    #print(results[0])
    if (results[0] is not None):
        watchPlaylist = ytm.get_watch_playlist(results[0]["videoId"])
        #print(watchPlaylist["lyrics"])
        if (watchPlaylist["lyrics"] is not None):
            lyrics = ytm.get_lyrics(watchPlaylist["lyrics"], timestamps=True)
            #print(type(lyrics["lyrics"]))
            if (lyrics is not None and type(lyrics["lyrics"]) is not None and type(lyrics["lyrics"]) == list):
                #print(lyrics["lyrics"])
                lrc = []
                for lyric in lyrics["lyrics"]:
                    lrc.append({"time":lyric.start_time/1000, "text":lyric.text})
                #print(lrc)
                return {"source":"ytm", "lrc":lrc}
            
    
    return get_lyrics_unofficial(incomingQuery)
    
