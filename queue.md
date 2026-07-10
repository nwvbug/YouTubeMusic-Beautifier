# YouTube Music Queue Scraping Guide

This document outlines the best DOM selectors and strategies for scraping queue information from YouTube Music, based on the `Full_Ytm_Html_Example_from_inspector.html` analysis.

## Core Selectors

### 1. The Queue Container
The queue lives inside a dedicated custom element. It persists in the DOM even if the user switches to the "Lyrics" or "Related" tabs.

- **Main Queue Element:** `ytmusic-player-queue#queue`
- **Standard Items List:** `#contents` (User-defined queue/playlist)
- **Autoplay/Radio List:** `#automix-contents` (Items added by YouTube's "Autoplay" algorithm)

### 2. Individual Queue Items
Instead of using index-based child access (e.g., `children[2]`), which is fragile, use these stable classes:

- **Item Selector:** `ytmusic-player-queue-item`
- **Current Song Marker:** `ytmusic-player-queue-item[selected]` or `ytmusic-player-queue-item[play-button-state="playing"]`

| Data Point | Selector | Notes |
| :--- | :--- | :--- |
| **Title** | `.song-title` | Use `.innerText` or the `title` attribute. |
| **Artist** | `.byline` | Found within `.byline-wrapper`. |
| **Thumbnail** | `.thumbnail img` | Extract the `src` attribute. |
| **Duration** | `.duration` | String format (e.g., "4:20"). |
| **Status** | `[play-button-state]` | Values: `playing`, `paused`, or `default`. |

### 3. Queue Context (Playlist/Source Metadata)
To identify the source of the current queue (e.g., "Your Mix", "Liked Music", or a specific Album):

- **Header Renderer:** `ytmusic-queue-header-renderer`
- **Source Name:** `.container-name .subtitle` (e.g., "Dark Thoughts Mix")

---

## Recommended Scraping Implementation

### Robust Item Extraction
Switch from index-based navigation to class-based queries to prevent breakage when YouTube updates their UI structure.

```javascript
function getQueueData() {
  const allItems = Array.from(document.querySelectorAll('ytmusic-player-queue-item'));
  
  return allItems.map(item => ({
    title: item.querySelector('.song-title')?.innerText,
    artist: item.querySelector('.byline')?.innerText,
    thumbnail: item.querySelector('.thumbnail img')?.src,
    duration: item.querySelector('.duration')?.innerText,
    isPlaying: item.hasAttribute('selected'),
    state: item.getAttribute('play-button-state') // 'playing', 'paused', or 'default'
  }));
}
```

### Finding the Current Position
```javascript
const items = Array.from(document.querySelectorAll('ytmusic-player-queue-item'));
const currentIndex = items.findIndex(item => item.hasAttribute('selected'));
```

### Optimization Tips
1. **Observer Target:** If using a `MutationObserver`, attach it to `document.querySelector('#queue #contents')` and `document.querySelector('#queue #automix-contents')` to minimize callback frequency.
2. **Lazy Loading:** YouTube Music lazy-loads the queue. If you need the *entire* queue, you may need to programmatically scroll the `#queue` container, though the immediate "Up Next" and "Autoplay" start are usually available immediately.
3. **Tab Persistence:** Note that while the elements exist, YouTube sometimes clears the inner HTML of the queue if the user stays on the "Lyrics" tab for a long duration to save memory.
