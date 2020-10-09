// import extensionizer from 'extensionizer';

// extensionizer.runtime.onMessageExternal.addListener(
//   function (request, sender) {
//     console.log({request, sender});
//   }
// );

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.log("Hello from the background", request, sender, sendResponse);
// });
// chrome.runtime.onInstalled.addListener(() => {
//   alert('Hello, World!');
// });
var browser = browser || {};
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Hello from the background", request, sender, sendResponse);

  browser.tabs.executeScript({
    file: "content-script.js"
  });
});