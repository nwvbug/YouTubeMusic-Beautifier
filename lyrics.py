import syncedlyrics


iterator = 0
def get_timed_lyrics(query):
    lrc = syncedlyrics.search(query)
    return lrc
    