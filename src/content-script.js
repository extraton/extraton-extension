const PostMessageStream = require("post-message-stream");
import extensionizer from 'extensionizer'

let s = document.createElement('script');
s.src = extensionizer.runtime.getURL('js/injection.js');
s.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);

const injectionStream = new PostMessageStream({name: 'content-script', target: 'injection'});
injectionStream.on('data', (data) => {
  //@todo disconnect
  chrome.runtime.sendMessage(data, function(response) {
    injectionStream.write(response);
  });
});
