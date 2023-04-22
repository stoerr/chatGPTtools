
/* Create actual bookmarklet e.g. using https://www.shareprogress.org/bookmarklet/ */
/* This deviates from the ChatGPT suggestion in the naming of the basePath and the URL, obviously. */

(function() {
  // Check if the ChatGPTBookmarklet has already been loaded on the page
  if (!window.hpsChatGPTBookmarklet) {
    // Set the path to the application
    var basePath = 'http://localhost:63342/chatgpt/docs/ChatGPTBookmarklet';

    // Load the ChatGPTBookmarklet JavaScript
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = basePath + '/ChatGPTBookmarklet.js';
    script.onload = function() {
      window.hpsChatGPTBookmarklet.init(basePath);
      window.hpsChatGPTBookmarklet.openDialog();
    };
    document.body.appendChild(script);
  } else {
    window.hpsChatGPTBookmarklet.openDialog();
  }
})();
