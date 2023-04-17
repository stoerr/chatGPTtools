/**
 * Library for several bookmarklets that are using ChatGPT in the browser to summarize pages, ask questions, create text and so forth.
 * Since https is required for this kind of use, we share it as a Gist for now and load it from there.
 *
 * @see "https://gist.github.com/stoerr/63f0c5a2a6e071ac0686b151fafe108d"
 */
// <script src="https://gist.githubusercontent.com/stoerr/63f0c5a2a6e071ac0686b151fafe108d/raw/ChatGPTBookmarkLib.js"></script>
var hpsChatGPTbookmarklets = (function () {

    this.hello = function () {
        alert("Hallo!");
    };

    return this;

})();

// in the browser: add this library, available at http://www.stoerr.net/public/bookmarkletlib.js to the bookmarklet, e.g. by adding
// javascript:(function(){var s=document.createElement('script');s.src='http://www.stoerr.net/public/bookmarkletlib.js';document.body.appendChild(s);})();
// or better, checking if it's already there:
//
javascript:(function () {
    if (!window.hpsChatGPTbookmarklets) {
        var s = document.createElement('script');
        s.src = 'https://gist.githubusercontent.com/stoerr/63f0c5a2a6e071ac0686b151fafe108d/raw/ChatGPTBookmarkLib.js?' + Math.random();
        document.body.appendChild(s);
    }
    setTimeout(() => hpsChatGPTbookmarklets.hello(), 100);
})();
