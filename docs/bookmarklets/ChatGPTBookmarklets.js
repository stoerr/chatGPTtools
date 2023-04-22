/**
 * The bookmarklets using ChatGPTBookmarkletLib.js.
 * Later: bookmarklet minifier http://mrcoles.com/bookmarklet/ or http://subsimple.com/bookmarklets/jsbuilder.htm
 */
// A bookmarklet accessing this would be:
javascript:(function () {
    if (!window.hpsChatGPTbookmarklets) {
        var s = document.createElement('script');
        s.src = 'https://stoerr.github.io/chatGPTtools/js/ChatGPTBookmarkletLib.js';
        document.body.appendChild(s);
    }
    setTimeout(() => hpsChatGPTbookmarklets.hello(), 100);
})();


// for reference: the printliminator

javascript:/*THE.PRINTLIMINATOR*/(function () {
    function loadScript(a, b) {
        var c = document.createElement('script'), d = document.getElementsByTagName('head')[0], e = !1;
        c.type = 'text/javascript', c.src = a, c.onload = c.onreadystatechange = function () {
            e || this.readyState && 'loaded' != this.readyState && 'complete' != this.readyState || (e = !0, b())
        }, d.appendChild(c)
    }

    loadScript('//css-tricks.github.io/The-Printliminator/printliminator.min.js', function () {
        thePrintliminator.init()
    });
})();


// for reference:
// https://mrcoles.com/bookmarklet/
javascript:(function () {
    function callback() {
        alert("test!")
    }

    var s = document.createElement("script");
    s.src = "https://foo.bar/ex.js";
    if (s.addEventListener) {
        s.addEventListener("load", callback, false)
    } else if (s.readyState) {
        s.onreadystatechange = callback
    }
    document.body.appendChild(s);
})();

// now the real thing
javascript:/*HpsChatGPTBookmarks*/(function () {
    function loadScript(url, init) {
        var scriptEl = document.createElement('script');
        var head = document.getElementsByTagName('head')[0];
        var isinitialized = false;
        scriptEl.type = 'text/javascript';
        scriptEl.src = url;
        scriptEl.onload = scriptEl.onreadystatechange = function () {
            isinitialized || this.readyState && 'loaded' !== this.readyState && 'complete' !== this.readyState || (isinitialized = true, init());
        };
        head.appendChild(scriptEl);
    }

    // var base = 'xxx/bookmarklets/';
    var base = 'http://localhost:63342/chatgpt/docs/bookmarklets/';
    if (!window.hpsChatGPTBookmarkletLib) {
        loadScript(base + 'ChatGPTBookmarkletLib.js', function () {
            hpsChatGPTBookmarkletLib.run(base);
        });
    } else {
        hpsChatGPTBookmarkletLib.run(base);
    }
})();

// encoded via https://www.shareprogress.org/bookmarklet/
javascript:(function()%7Bfunction%20loadScript(url%2C%20init)%20%7B%0A%20%20%20%20%20%20%20%20var%20scriptEl%20%3D%20document.createElement(%27script%27)%3B%0A%20%20%20%20%20%20%20%20var%20head%20%3D%20document.getElementsByTagName(%27head%27)%5B0%5D%3B%0A%20%20%20%20%20%20%20%20var%20isinitialized%20%3D%20false%3B%0A%20%20%20%20%20%20%20%20scriptEl.type%20%3D%20%27text%2Fjavascript%27%3B%0A%20%20%20%20%20%20%20%20scriptEl.src%20%3D%20url%3B%0A%20%20%20%20%20%20%20%20scriptEl.onload%20%3D%20scriptEl.onreadystatechange%20%3D%20function%20()%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20isinitialized%20%7C%7C%20this.readyState%20%26%26%20%27loaded%27%20!%3D%3D%20this.readyState%20%26%26%20%27complete%27%20!%3D%3D%20this.readyState%20%7C%7C%20(isinitialized%20%3D%20true%2C%20init())%3B%0A%20%20%20%20%20%20%20%20%7D%3B%0A%20%20%20%20%20%20%20%20head.appendChild(scriptEl)%3B%0A%20%20%20%20%7D%0A%0A%20%20%20%20%2F%2F%20var%20base%20%3D%20%27xxx%2Fbookmarklets%2F%27%3B%0A%20%20%20%20var%20base%20%3D%20%27http%3A%2F%2Flocalhost%3A63342%2Fchatgpt%2Fdocs%2Fbookmarklets%2F%27%3B%0A%20%20%20%20if%20(!window.hpsChatGPTBookmarkletLib)%20%7B%0A%20%20%20%20%20%20%20%20loadScript(base%20%2B%20%27ChatGPTBookmarkletLib.js%27%2C%20function%20()%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20hpsChatGPTBookmarkletLib.run(base)%3B%0A%20%20%20%20%20%20%20%20%7D)%3B%0A%20%20%20%20%7D%20else%20%7B%0A%20%20%20%20%20%20%20%20hpsChatGPTBookmarkletLib.run(base)%3B%0A%20%20%20%20%7D%7D)()
