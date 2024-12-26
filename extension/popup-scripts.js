console.log("document")
document.getElementById('openWebApp').addEventListener('click', () => {
    // Open the web app in a new window/tab (adjust as needed)
    const extensionUrl = chrome.runtime.getURL('');
    chrome.tabs.create({ url: extensionUrl+"/webapp.html" });
});