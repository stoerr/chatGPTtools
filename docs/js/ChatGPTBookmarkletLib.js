/**
 * Library for several bookmarklets that are using ChatGPT in the browser to summarize pages, ask questions, create text and so forth.
 */
var hpsChatGPTbookmarklets = (function () {

    this.hello = function () {
        alert("Hallo!");
    };

    return this;

})();

// A bookmarklet accessing this would be:
// javascript:(function () {
//     if (!window.hpsChatGPTbookmarklets) {
//         var s = document.createElement('script');
//         s.src = 'https://stoerr.github.io/chatGPTtools/js/ChatGPTBookmarkletLib.js';
//         document.body.appendChild(s);
//     }
//     setTimeout(() => hpsChatGPTbookmarklets.hello(), 100);
// })();
