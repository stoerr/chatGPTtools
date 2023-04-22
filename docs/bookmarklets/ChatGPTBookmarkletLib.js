/**
 * Library for several bookmarklets that are using ChatGPT in the browser to summarize pages, ask questions, create text and so forth.
 * For the bookmarklets to use this, see ChatGPTBookmarklets.js.
 */
hpsChatGPTBookmarkletLib = (function () {

    this.run = function (base) {
        this.base = base;
        this.loadChatGPTPopup();
    };

    this.loadChatGPTPopup = function () {
        this.popup = this.popup || document.getElementById('hpsChatGPTPopupLoader');
        if (!this.popup) {
            var url = this.base + 'ChatGPTPopup.html';
            var that = this;
            fetch(url)
                .then(function (response) {
                    return response.text();
                })
                .then(function (html) {
                    var div = document.createElement('div');
                    div.id = 'hpsChatGPTPopupLoader';
                    div.innerHTML = html;
                    document.body.appendChild(div);
                    that.popup = document.getElementById('hpsChatGPTPopupLoader');

                    // add a css reference to the head that refers to base+'ChatGPTPopup.css'
                    var css = document.createElement('link');
                    css.rel = 'stylesheet';
                    css.href = that.base + 'ChatGPTPopup.css';
                    document.head.appendChild(css);

                    that.showPopup();
                })
                .catch(function (err) {
                    console.log('Failed to fetch page: ', err);
                });
        } else {
            this.showPopup();
        }
    };

    this.showPopup = function () {
        this.popup.style.display = 'block';
    };

    this.hidePopup = function () {
        this.popup.style.display = 'none';
    }

    return this;

})();
