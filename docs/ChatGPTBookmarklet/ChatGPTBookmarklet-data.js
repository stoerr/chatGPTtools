/** Loads the parts of the library that contain pure data, not code. */
(function (window) {
    window.hpsChatGPTBookmarklet = window.hpsChatGPTBookmarklet || {};

    var hpsChatGPTBookmarklet= {
        helptext: 'Usage:<br>When you open the dialog, a request to summarize the text of the whole page is automatically sent to ChatGPT. You can also ask your own questions by typing the question into the Ask a question field and submit with the button or the enter key that to get an answer. If "include page content" is selected, the page text is added. If text was selected before calling this bookmarklet, we take the selected text instead. If the text is more than 2000 words (depending on the model), we replace the middle of the text by ... to avoid hitting ChatGPT limits. You can also copy the answer to the clipboard.<br>The dialog is draggable on the title bar and the icons on the top right can maximize it or move it to the right or left.<br>The dictation button &#x1F3A4; can be used to dictate a question - keep the button pressed while you are talking.',

        /** Three backticks to "quote" something in the prompt. */
        // We encode that to be able to process this with the chatgptfixfile script.
        threebackticks:  String.fromCharCode(96) + String.fromCharCode(96) + String.fromCharCode(96)
    };

    Object.assign(window.hpsChatGPTBookmarklet, hpsChatGPTBookmarklet);
})(window);
