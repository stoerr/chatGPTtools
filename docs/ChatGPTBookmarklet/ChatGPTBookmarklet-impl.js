/** The parts of thelibrary that are dialog implementation. */
(function (window) {
    window.hpsChatGPTBookmarklet = window.hpsChatGPTBookmarklet || {};

    var hpsChatGPTBookmarklet = {

        init: async function () {
            if (!this.initialized) {
                this.initialized = true;

                this.selectedText = this.getSelectedText();
                this.pageContent = this.getPageContent();
                this.clipped = false;

                this.answerfield = document.getElementById('hpsChatGPTAnswer');
                this.getIncludedText(); // sets clipped to true if text was clipped
                if (this.clipped) {
                    document.getElementById('clipped').classList.remove('hidden');
                }
                // set the focus on the textarea
                document.getElementById('hpsChatGPTQuestion').focus();
            }
        },

        openDialogImpl: async function () {
            this.init();
            this.showDialog();
            try {
                this.answerfield.innerText = 'Contacting ChatGPT for summary...';
                const summary = await this.getSummary();
                this.answerfield.innerText = summary;
            } catch (e) {
                this.answerfield.innerText = 'Error: ' + e;
            }
        },

        showDialog: function () {
            if (this.dialog) {
                this.dialog.style.display = 'block';
            }
        },

        hideDialog: function () {
            if (this.dialog) {
                this.dialog.style.display = 'none';
            }
        },

        handleKeydown: function (event) {
            if (event.key === 'Escape') {
                this.hideDialog();
            }
        },

        submitQuestion: async function () {
            const question = document.getElementById('hpsChatGPTQuestion').value;
            const includePageContent = document.getElementById('hpsChatGPTIncludePageContent').checked;

            if (question.trim() !== '') {
                this.answerfield.innerText = 'Thinking...';
                try {
                    const answer = await this.getAnswer(question, includePageContent);
                    this.answerfield.innerText = answer;
                } catch (e) {
                    this.answerfield.innerText = 'Error: ' + e;
                }
            } else {
                alert('Please enter a question before submitting.');
            }
        },

        getPageContent: function () {
            return document.body.innerText;
        },

        getSelectedText: function () {
            const selection = window.getSelection();
            return selection.toString();
        },

        getIncludedText: function () {
            let thetext = this.selectedText || this.pageContent;
            // if thetext contains more than 2000 words, we remove the middle so that it's now 2000 words
            // this is to avoid hitting the API limit of 2048 tokens
            const whitespaceregex = /\s+/gm;
            if (thetext.split(whitespaceregex).length > 1800) {
                const words = thetext.trim().split(whitespaceregex);
                thetext = words.slice(0, 900).join(" ") + "\n...\n" + words.slice(words.length - 900).join(" ");
                this.clipped = true;
                if (document.getElementById('clipped')) {
                    document.getElementById('clipped').classList.remove('hidden');
                }
            }
            return thetext;
        },

        copyToClipboard: function () {
            const answer = this.answerfield;
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(answer);
            selection.removeAllRanges();
            selection.addRange(range);

            try {
                document.execCommand('copy');
                alert('Answer copied to clipboard!');
            } catch (err) {
                console.error('Unable to copy the answer to clipboard:', err);
            }

            // Deselect the copied text
            selection.removeAllRanges();
        },

        getSummary: async function () {
            const content = threebackticks + "\n" + this.getIncludedText().trim() + "\n" + threebackticks + "\n\n" +
                "=== Instructions ===\n" +
                "Create a summary of this text. Focus on new or surprising information.";
            const messages = [{role: 'user', content: content}];
            const summary = await this.sendChatGPTRequest(messages);
            return summary;
        },

        getAnswer: async function (question, includePageContent) {
            let textinclude = threebackticks + "\n" + this.getIncludedText().trim() + "\n" + threebackticks + "\n\n" +
                "=== Instructions ===\n" +
                "Please answer the following question with regard to the text above:\n";
            const content = includePageContent ? textinclude + question : question;
            const messages = [{role: 'user', content: content}];
            const answer = await this.sendChatGPTRequest(messages);
            return answer;
        },

        toggleMaximize: function () {
            const dialogContainer = document.querySelector('.hpsChatGPTDialog-container');
            const maximizeButton = document.getElementById('hpsChatGPTMaximize');
            const isMaximized = dialogContainer.classList.toggle('hps-chatgpt-maximize-maximized');
            maximizeButton.innerText = isMaximized ? '[-]' : '[+]';
        },

        showHelp: function () {
            this.answerfield.innerHTML = hpsChatGPTBookmarklet.helptext;
        }

        /** Used here but declared in another file:
         * Sends a chat request to the OpenAI ChatGPT API and retrieves the response, incl. retry logic.
         * @param {Object[]} messages - array of message objects to be sent to the ChatGPT API. Each object should have 'role' and 'content' properties.
         * @returns {Promise<string>} promise that resolves to the content of the response message from the API.
         * @throws in case of irrecoverable errors
         */
        // sendChatGPTRequest: async function (messages) { /** omitted here */ }

        /** Used here but declared in another file: usage description in helptext */
        // helptext: /** omitted here */

    };

    Object.assign(window.hpsChatGPTBookmarklet, hpsChatGPTBookmarklet);
})(window);