
/* Create actual bookmarklet e.g. using https://www.shareprogress.org/bookmarklet/ */

javascript:/*ChatGPTBookmarklet*/(function() {
  function load(basePath, apikey) {
    if (!window.hpsChatGPTBookmarklet) {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = basePath + '/ChatGPTBookmarklet.js';
      script.onload = function () {
        window.hpsChatGPTBookmarklet.init(basePath, apikey);
        window.hpsChatGPTBookmarklet.openDialog();
      };
      document.body.appendChild(script);
    } else {
      window.hpsChatGPTBookmarklet.openDialog();
    }
  }
  load('https://stoerr.github.io/chatGPTtools/ChatGptBookmarklet', 'XXX');
})();

// locally from IntelliJ: 'http://localhost:63342/chatgpt/docs/ChatGPTBookmarklet'
// replace XXX by your API key

// actual bookmarklet to copy into the bookmark, for the deployed version; replace XXX by your API key:
// TODO
