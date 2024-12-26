chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'sendData') {
        sendResponse("yippee")
        // Store the data or pass it directly to the web app
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'displayData', data: request.data }); 
        });
    }
  });