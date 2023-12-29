
/* To create actual bookmarklet use e.g. https://www.shareprogress.org/bookmarklet/, or,
even better, open https://chatGPTtools.stoerr.net/ in the browser and grab it from there. */

javascript:/*ChatGPTBookmarklet*/(function() {
  function load(basePath, apikey) {
    if (!window.hpsChatGPTBookmarklet) {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = basePath + '/ChatGPTBookmarklet.js';
      script.onload = function () {
        window.hpsChatGPTBookmarklet.init(basePath, apikey, window.hpsChatGPTBookmarklet.openDialog);
      };
      document.body.appendChild(script);
    } else {
      window.hpsChatGPTBookmarklet.openDialog();
    }
  }
  load('https://chatGPTtools.stoerr.net/ChatGPTBookmarklet', 'XXX');
})();

// locally from IntelliJ: 'http://localhost:63342/chatgpt/docs/ChatGPTBookmarklet'
// replace XXX by your API key

// actual bookmarklet to copy into the bookmark, for the deployed version; replace XXX by your API key:
// javascript:(function()%7Bjavascript%3A%2F*ChatGPTBookmarklet*%2F(function()%20%7B%0A%20%20function%20load(basePath%2C%20apikey)%20%7B%0A%20%20%20%20if%20(!window.hpsChatGPTBookmarklet)%20%7B%0A%20%20%20%20%20%20var%20script%20%3D%20document.createElement(%27script%27)%3B%0A%20%20%20%20%20%20script.type%20%3D%20%27text%2Fjavascript%27%3B%0A%20%20%20%20%20%20script.src%20%3D%20basePath%20%2B%20%27%2FChatGPTBookmarklet.js%27%3B%0A%20%20%20%20%20%20script.onload%20%3D%20function%20()%20%7B%0A%20%20%20%20%20%20%20%20window.hpsChatGPTBookmarklet.init(basePath%2C%20apikey%2C%20window.hpsChatGPTBookmarklet.openDialog)%3B%0A%20%20%20%20%20%20%7D%3B%0A%20%20%20%20%20%20document.body.appendChild(script)%3B%0A%20%20%20%20%7D%20else%20%7B%0A%20%20%20%20%20%20window.hpsChatGPTBookmarklet.openDialog()%3B%0A%20%20%20%20%7D%0A%20%20%7D%0A%20%20load(%27https%3A%2F%2Fstoerr.github.io%2FchatGPTtools%2FChatGPTBookmarklet%27%2C%20%27XXX%27)%3B%0A%7D)()%3B%7D)()
