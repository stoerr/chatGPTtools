/** This is the actual bookmarklet that loads the grabStyles javascript library and starts it.
 * I create a separate loader so that I can easily fix things without having to edit the bookmark. */

/* To create actual bookmarklet use e.g. https://www.shareprogress.org/bookmarklet/, or,
even better, open https://stoerr.github.io/chatGPTtools/ in the browser and grab it from there. */

javascript:/*net.stoerr.chatGPT.grabStyles*/(function () {
    function load(basePath) {
        if (!window.netStoerrGrabStyles) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = basePath + '/grabStyles.js';
            script.onload = function () {
                window.netStoerrGrabStyles.init(basePath);
                window.netStoerrGrabStyles.start();
            };
            document.body.appendChild(script);
        } else {
            window.netStoerrGrabStyles.start();
        }
    }

    // load('https://stoerr.github.io/chatGPTtools/grabStyles');
    load('http://localhost:63342/chatgpt/docs/grabStyles');
})();
