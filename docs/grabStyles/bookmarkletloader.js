/** This is the actual bookmarklet that loads the grabStyles javascript library and starts it.
 * I create a separate loader so that I can easily fix things without having to edit the bookmark. */

/* Create actual bookmarklet e.g. using https://www.shareprogress.org/bookmarklet/ */

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

// actual bookmarklet to copy into the bookmark comes now. That's an urlencoded version of the above.
// javascript:(function()%7Bjavascript%3A%2F*net.stoerr.chatGPT.grabStyles*%2F(function () %7B%0A    function load(basePath) %7B%0A        if (!window.netStoerrGrabStyles) %7B%0A            var script %3D document.createElement(%27script%27)%3B%0A            script.type %3D %27text%2Fjavascript%27%3B%0A            script.src %3D basePath %2B %27%2FgrabStyles.js%27%3B%0A            script.onload %3D function () %7B%0A                window.netStoerrGrabStyles.init(basePath)%3B%0A                window.netStoerrGrabStyles.start()%3B%0A            %7D%3B%0A            document.body.appendChild(script)%3B%0A        %7D else %7B%0A            window.netStoerrGrabStyles.start()%3B%0A        %7D%0A    %7D%0A%0A    %2F%2F load(%27https%3A%2F%2Fstoerr.github.io%2FchatGPTtools%2FgrabStyles%27)%3B%0A    load(%27http%3A%2F%2Flocalhost%3A63342%2Fchatgpt%2Fdocs%2FgrabStyles%27)%3B%0A%7D)()%3B%7D)()
