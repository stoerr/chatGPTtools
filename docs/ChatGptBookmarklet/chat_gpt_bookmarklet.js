
/* Create actual bookmarklet e.g. using https://www.shareprogress.org/bookmarklet/ */
/* This deviates from the ChatGPT suggestion in the naming of the basePath and the URL, obviously. */

javascript:(function() {
  (async function() {
    // Check if the ChatGPTBookmarklet has already been loaded on the page
    if (!window.hpsChatGPTBookmarkletLoaded) {
      // Mark the ChatGPTBookmarklet as loaded
      window.hpsChatGPTBookmarkletLoaded = true;

      // Set the path to the application
      var basePath = 'http://localhost:63342/chatgpt/docs/ChatGPTBookmarklet';

      // Dynamically import the ChatGPTBookmarklet module and call the init function
      const chatGPTModule = await import(basePath + '/ChatGPTBookmarklet.js');
      chatGPTModule.initChatGPTBookmarklet(basePath);
    } else {
      // If already loaded, just show the dialog
      window.hpsChatGPTComponents.showDialog();
    }
  })();
})();
