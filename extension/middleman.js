var contentId;
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'sendData') {
        sendResponse("passing data thru")
        contentId = sender.tab.id
        // Store the data or pass it directly to the web app
        chrome.runtime.sendMessage({ action: 'displayData-ytmlyrics', data: request.data }); 
        
    }
    else if (request.action === 'ytm-pause') {
        console.log("MIDDLE MAN RECIEVED PAUSE")
        sendResponse("pausing")
        chrome.tabs.sendMessage(contentId, { action: 'pause-from-middleman-ytm', data: null }, (response) => {
            console.log("Response heard.")
        }); 
    }
    else if (request.action === 'ytm-back') {
        console.log("MIDDLE MAN RECIEVED BACK")
        sendResponse("going back")
        chrome.tabs.sendMessage(contentId, { action: 'back-from-middleman-ytm', data: null }, (response) => {
            console.log("Response heard.")
        }); 
    }
    else if (request.action === 'ytm-next') {
        console.log("MIDDLE MAN RECIEVED next")
        sendResponse("going next")
        chrome.tabs.sendMessage(contentId, { action: 'next-from-middleman-ytm', data: null }, (response) => {
            console.log("Response heard.")
        }); 
    }
  });

