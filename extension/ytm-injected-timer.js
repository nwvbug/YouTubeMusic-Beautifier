setInterval(() => {
    const player = document.getElementById('movie_player');
    if (player && typeof player.getCurrentTime === 'function') {
        window.postMessage({
            type: 'YTM_INTERNAL_TIME',
            currentTime: player.getCurrentTime(), 
            isPaused: player.getPlayerState() === 2 
        }, '*');
    }
}, 100);