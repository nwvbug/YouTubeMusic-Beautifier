# Gemini Context for YouTubeMusic-Beautifier

This document provides a summary of the project's architecture and key components to facilitate ongoing development and debugging.

## 1. Project Overview

YouTubeMusic-Beautifier is a Chrome extension that enhances the YouTube Music web client. Its primary features are:
- **Time-Synced Lyrics:** Displays accurate, time-synced lyrics for the currently playing song.
- **Live Share & Remote Control:** Allows users to control their PC's playback from a mobile device and share the experience live.
- **Enhanced Visuals:** Provides a beautiful, full-screen view with animated backgrounds derived from the song's album art.

## 2. Architecture & Core Concepts

The extension follows a standard Manifest V3 architecture, separating responsibilities into content scripts, a background service worker, and extension pages.

- **Content Script (`ytm-controller.js`):** Injected into the YouTube Music tab. It's responsible for scraping data from the page and controlling playback.
- **Service Worker (`middleman.js`):** The central "brain" of the extension. It's non-persistent and event-driven. It manages state, routes messages between all components, and handles logic like fetching lyrics.
- **Extension Pages (`webapp.html`, `popup.html`):** These are the user-facing UI components. `webapp.html` is the main full-screen display, and `popup.html` is the small window that appears when clicking the extension icon.
- **Offscreen Document (`offscreen.html`, `sockets.js`):** A persistent but hidden page that runs in the background. Its sole purpose is to maintain a WebSocket connection for the Live Share / Remote Control feature, a task for which service workers are ill-suited due to their ephemeral nature. It plays silent audio to prevent Chrome from suspending it.

### Data Flow
The general data flow is as follows:
1.  **`ytm-controller.js`** observes the YTM player for changes.
2.  On change, it sends the song data to **`middleman.js`**.
3.  **`middleman.js`** processes the data, fetches lyrics from an external server, and maintains the overall state.
4.  `middleman.js` then broadcasts this updated state to **`reciever.js`** (running in `webapp.html`) for display.
5.  If remote control is active, `middleman.js` also sends the state to **`sockets.js`** in the offscreen document, which relays it to connected clients via WebSocket.
6.  User actions from the `webapp.html` (e.g., Pause) or remote clients are sent back to `middleman.js`, which then sends a command to `ytm-controller.js` to perform the action on the YTM page.

## 3. Message Passing System

Communication between components is handled via a standardized message-passing system using `chrome.runtime.sendMessage`. All messages are objects with a `type` (string) and a `payload` (any).

- **`middleman.js`** acts as the central router for almost all messages.

| Source                 | Destination            | Message Type                        | Purpose                                             |
| ---------------------- | ---------------------- | ----------------------------------- | --------------------------------------------------- |
| `ytm-controller.js`    | `middleman.js`         | `YTM_DATA_UPDATE`                   | Send new song data from YTM page.                   |
| `webapp-controller.js` | `middleman.js`         | `WEBAPP_REQUEST_...` (e.g., `_PLAY_PAUSE`, `_NEXT`) | Request a playback action.                  |
| `liveutils.js`         | `middleman.js`         | `WEBAPP_START_SHARING`, `WEBAPP_DISABLE_SHARING`, `WEBAPP_SWAP_REMOTE_CONTROL`, `WEBAPP_KICK_USER` | Manage the live share session.                       |
| `middleman.js`         | `reciever.js` (webapp) | `STATE_UPDATE`, `WEBAPP_ROOM_CREATED`, `WEBAPP_CLIENT_JOINED`, `WEBAPP_CLIENT_DISCONNECTED` | Send new state to display, send live share updates. |
| `sockets.js` (Offscreen) | `middleman.js`         | `REMOTE_ROOM_CREATED`, `REMOTE_CLIENT_...`, `REMOTE_REQUEST_...` | Relay events from WebSocket (e.g., room created, remote command). |
| `middleman.js`         | `sockets.js` (Offscreen) | `OFFSCREEN_START_SHARING`, `OFFSCREEN_UPDATE_DATA`, `OFFSCREEN_DISABLE_SHARING`, `OFFSCREEN_KICK_USER` | Command the WebSocket client (e.g., start sharing, send update). |
| `popup.js`             | `middleman.js`         | `POPUP_REQUEST_IMAGE`               | Ask for the current album art.                      |

## 4. Key File Descriptions

- **`extension/middleman.js`**: The background service worker. Manages state (current song, lyrics, live share status), routes messages, fetches lyrics from the `https://ytm.nwvbug.com` API, and controls the offscreen document's lifecycle. It contains the main message listener for the extension's backend logic.
- **`extension/ytm-controller.js`**: Content script for the YTM page. Uses a `MutationObserver` to scrape song data and listens for messages from `middleman.js` to execute playback controls (play, pause, next, etc.).
- **`extension/webapp.html`**: The main full-screen UI. It loads `webapp-controller.js`, `displayer.js`, `liveutils.js`, and `reciever.js`.
- **`extension/webapp-controller.js`**: Handles user interactions within the `webapp.html` UI that are not related to live sharing. It sends messages to `middleman.js` for playback control.
- **`extension/liveutils.js`**: Handles user interactions related to the Live Share feature in `webapp.html`. It sends messages like `WEBAPP_START_SHARING` to `middleman.js`.
- **`extension/displayer.js`**: A controller for `webapp.html` that handles the visual rendering logic. This includes updating the animated canvas background (`backgroundMovingImage.js`), managing lyric highlighting and scrolling, and handling DOM updates for song information.
- **`extension/sockets.js`**: Runs in the offscreen document. Manages the Socket.IO connection to the remote control server (`wss://ws.nwvbug.com`). It forwards remote commands to `middleman.js` and sends local song data to remote clients.
- **`extension/reciever.js`**: The main message listener for the `webapp.html` page. It receives `STATE_UPDATE` messages from `middleman.js` and calls the appropriate functions in `displayer.js` and `liveutils.js` to update the UI.

