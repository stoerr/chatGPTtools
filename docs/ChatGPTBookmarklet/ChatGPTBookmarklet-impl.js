/** The parts of thelibrary that are dialog implementation. */
(function (window) {
    window.hpsChatGPTBookmarklet = window.hpsChatGPTBookmarklet || {};

    var hpsChatGPTBookmarklet = {

        init: async function () {
            if (!this.initialized) {
                const that = this;
                this.initialized = true;
                this.makeDialogDraggable();
                // Detect user's preferred language
                const userLang = navigator.language || navigator.userLanguage;
                this.lang = userLang.startsWith('de') ? 'de' : 'en';

                this.selectedText = this.getSelectedText();
                this.pageContent = this.getPageContent();
                this.clipped = false;

                this.answerfield = document.getElementById('hpsChatGPTAnswer');
                this.getIncludedText(); // sets clipped to true if text was clipped
                // set the focus on the textarea
                document.getElementById('hpsChatGPTQuestion').focus();

                document.getElementById('hpsChatGPTQuestion').addEventListener('keydown', function (event) {
                    if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
                        event.preventDefault();
                        that.submitQuestion();
                    }
                });
                document.getElementById('hps-chatgpt-model-selector').addEventListener('change', function (event) {
                    this.getIncludedText();
                });
            }
        },

        openDialogImpl: async function () {
            this.init();
            this.showDialog();
            try {
                this.answerfield.innerHTML = 'Contacting ChatGPT for summary...<br/><br/>' + this.helptext;
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
                // also undo the effects of sidebyside, if that was applied
                const fullframe = document.getElementById('hpsChatGPTDialog-fullframe');
                if (fullframe) {
                    const origpage = document.getElementById('hpsChatGPTDialog-origpage');
                    // move all children of origpage back to body and then remove fullframe
                    while (origpage.firstChild) {
                        document.body.appendChild(origpage.firstChild);
                    }
                    document.body.removeChild(fullframe);
                }
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
            // if thetext contains more than data-clipwords words, we remove the middle so that it's now data-clipwords words
            // this is to avoid hitting the API limit of 2048 tokens
            const whitespaceregex = /\s+/gm;
            const words = thetext.trim().split(whitespaceregex);
            let wordcount = words.length;
            const clipwords = parseInt(document.getElementById('hps-chatgpt-model-selector').selectedOptions[0].dataset.clipwords);
            if (wordcount > (clipwords - 200)) {
                console.log('Clipping because of wordcount' + wordcount);
                thetext = words.slice(0, clipwords / 2 - 100).join(" ") + "\n...\n" + words.slice(words.length - clipwords / 2 + 100).join(" ");
                this.clipped = true;
                if (document.getElementById('clipped')) {
                    document.getElementById('clipped').classList.remove('hidden');
                }
            }
            if (this.clipped) {
                document.getElementById('clipped').classList.remove('hidden');
            } else {
                document.getElementById('clipped').classList.add('hidden');
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
            const instructions = this.lang === 'de' ?
                "Erstelle eine Zusammenfassung des folgenden Texts auf Deutsch. Konzentriere dich auf neue oder überraschende Informationen.\n\n" :
                "Create a summary of this text. Focus on new or surprising information.\n\n";
            const content = this.getIncludedText().trim();
            const messages = [{role: 'user', content: content}];
            const selectedModel = document.getElementById('hps-chatgpt-model-selector').value;
            return this.promptOnText(instructions, content, selectedModel);
        },

        getAnswer: async function (question, includePageContent) {
            const instructions = this.lang === 'de' ?
                "\nBitte beantworte diese Frage in Bezug auf den folgenden Text auf Deutsch:\n" :
                "\nPlease answer this question with regard to the following text:\n";
            const content = includePageContent ? this.getIncludedText().trim() : '';
            const messages = [{role: 'user', content: content}];
            const selectedModel = document.getElementById('hps-chatgpt-model-selector').value;
            return this.promptOnText(question, textinclude, selectedModel);
        },

        promptOnText: async function (prompt, text, model) {
            const content = prompt + this.threebackticks + "\n" + text + "\n" + this.threebackticks;
            const messages = [{role: 'user', content: prompt + "\n" + text}];
            console.log('sent messages: ', messages);
            return this.sendChatGPTRequest(messages, model);
        },

        toggleMaximize: function () {
            const dialogContainer = document.querySelector('.hpsChatGPTDialog-container');
            const maximizeButton = document.getElementById('hpsChatGPTMaximize');
            const isMaximized = dialogContainer.classList.toggle('hps-chatgpt-maximize-maximized');
            maximizeButton.innerText = isMaximized ? '[-]' : '[+]';
            var dialog = document.getElementById('hpsChatGPTDialog');
            if (isMaximized) {
                this.savedDragPosition = dialog.style.cssText;
                dialog.style.cssText = '';
            } else {
                dialogContainer.classList.remove('hps-chatgpt-expand-left', 'hps-chatgpt-expand-right');
                dialog.style.cssText = this.savedDragPosition;
            }
        },

        showHelp: function () {
            this.answerfield.innerHTML = this.helptext;
        },

        expandLeft: function () {
            const dialogContainer = document.querySelector('.hpsChatGPTDialog-container');
            dialogContainer.classList.add('hps-chatgpt-expand-left');
            this.toggleMaximize();
        },

        expandRight: function () {
            const dialogContainer = document.querySelector('.hpsChatGPTDialog-container');
            dialogContainer.classList.add('hps-chatgpt-expand-right');
            this.toggleMaximize();
        },

        /** Lets the page occupy 70% of the width at the left and the dialog the rest at the right. */
        sidebyside: function () {
            // don't do anything if we are already in sidebyside mode
            if (document.getElementById('hpsChatGPTDialog-fullframe')) {
                return;
            }
            const fullframe = document.createElement('div');
            fullframe.id = 'hpsChatGPTDialog-fullframe';
            const origpage = document.createElement('div');
            origpage.id = 'hpsChatGPTDialog-origpage';
            fullframe.appendChild(origpage);
            const body = document.body;
            while (body.firstChild) {
                origpage.appendChild(body.firstChild);
            }
            document.body.appendChild(fullframe);
            this.expandRight();
        },

        makeDialogDraggable: function () {
            var dialog = document.getElementById('hpsChatGPTDialog');
            var dragheader = document.getElementById('hps-chatgpt-dragheader');
            var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

            dragheader.onmousedown = dragMouseDown;

            function dragMouseDown(e) {
                e = e || window.event;
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }

            function elementDrag(e) {
                e = e || window.event;
                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                // set the element's new position:
                dialog.style.setProperty('top', `${dialog.offsetTop - pos2}px`, 'important');
                dialog.style.setProperty('left', `${dialog.offsetLeft - pos1}px`, 'important');
            }

            function closeDragElement() {
                // stop moving when mouse button is released:
                document.onmouseup = null;
                document.onmousemove = null;
            }
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
