
/* Create actual bookmarklet e.g. using https://www.shareprogress.org/bookmarklet/ */
/* This deviates from the ChatGPT suggestion in the naming of the basePath and the URL, obviously. */

javascript:/*ChatGPTBookmarkletV1GPT*/(function() {
  // Check if the ChatGPTBookmarklet has already been loaded on the page
  if (!window.hpsChatGPTBookmarklet) {
    // Set the path to the application
    // var basePath = 'http://localhost:63342/chatgpt/docs/ChatGPTBookmarklet';
    var basePath = 'https://chatGPTtools.stoerr.net/ChatGptBookmarklet-V1GPT';

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

// actually use the minified form in the bookmarklet:
javascript:/*ChatGPTBookmarkletV1GPT*/(function()%7B%2F%2F Check if the ChatGPTBookmarklet has already been loaded on the page%0A  if (!window.hpsChatGPTBookmarklet) %7B%0A    %2F%2F Set the path to the application%0A    %2F%2F var basePath %3D %27http%3A%2F%2Flocalhost%3A63342%2Fchatgpt%2Fdocs%2FChatGPTBookmarklet%27%3B%0A    var basePath %3D %27https%3A%2F%2Fchatgpttools.stoerr.net%2FChatGptBookmarklet-V1GPT%27%3B%0A%0A    %2F%2F Load the ChatGPTBookmarklet JavaScript%0A    var script %3D document.createElement(%27script%27)%3B%0A    script.type %3D %27text%2Fjavascript%27%3B%0A    script.src %3D basePath %2B %27%2FChatGPTBookmarklet.js%27%3B%0A    script.onload %3D function() %7B%0A      window.hpsChatGPTBookmarklet.init(basePath)%3B%0A      window.hpsChatGPTBookmarklet.openDialog()%3B%0A    %7D%3B%0A    document.body.appendChild(script)%3B%0A  %7D else %7B%0A    window.hpsChatGPTBookmarklet.openDialog()%3B%0A  %7D%7D)()
