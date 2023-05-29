(function () {
    var hpsChatGPTBookmarklet = {
        basePath: '',
        apikey: '',
        dialog: null,
        helptext: 'Usage:<br>When you open the dialog, a request to summarize the text of the whole page is automatically sent to ChatGPT. You can also ask your own questions by typing the question into the Ask a question field and submit that to get an answer. If "include page content" is selected, the page text is added. If text was selected before calling this bookmarklet, we take the selected text instead. If the text is more than 2000 words, we replace the middle of the text by ... to avoid hitting ChatGPT limits. You can also copy the answer to the clipboard.',

        init: async function (basePath, apikey, callbackWhenHTMLLoaded) {
            this.basePath = basePath;
            this.apikey = apikey;

            this.selectedText = this.getSelectedText();
            this.pageContent = this.getPageContent();
            this.clipped = false;

            await this.loadCSS();
            await this.loadHTML(callbackWhenHTMLLoaded);

            document.getElementById('hpsChatGPTCloseTop').addEventListener('click', this.hideDialog.bind(this));
            document.getElementById('hpsChatGPTCloseBottom').addEventListener('click', this.hideDialog.bind(this));
            document.getElementById('hpsChatGPTSubmit').addEventListener('click', this.submitQuestion.bind(this));
            document.getElementById('hpsChatGPTCopyToClipboard').addEventListener('click', this.copyToClipboard.bind(this));
            document.getElementById('hpsChatGPTMaximize').addEventListener('click', this.toggleMaximize.bind(this));
            document.getElementById('hpsChatGPTHelp').addEventListener('click', this.showHelp.bind(this));

            // if the user types escape, the dialog is closed (hideDialog is called)
            document.getElementById('hpsChatGPTDialog').addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    this.hideDialog();
                }
            });
        },

        loadCSS: function () {
            return new Promise((resolve) => {
                var cssLink = document.createElement('link');
                cssLink.rel = 'stylesheet';
                cssLink.type = 'text/css';
                cssLink.href = this.basePath + '/ChatGPTBookmarklet.css';
                cssLink.onload = resolve;
                document.head.appendChild(cssLink);
            });
        },

        loadHTML: async function (callbackWhenHTMLLoaded) {
            const response = await fetch(this.basePath + '/ChatGPTBookmarklet.html');

            if (response.ok) {
                const html = await response.text();
                this.dialog = document.createElement('div');
                this.dialog.innerHTML = html;
                document.body.appendChild(this.dialog);
                this.answerfield = document.getElementById('hpsChatGPTAnswer');
                if (this.clipped) {
                    document.getElementById('clipped').classList.remove('hidden');
                }
                // set the focus on the textarea
                document.getElementById('hpsChatGPTQuestion').focus();
                if (callbackWhenHTMLLoaded) {
                    callbackWhenHTMLLoaded.bind(hpsChatGPTBookmarklet)();
                }
            } else {
                console.error('Failed to load ChatGPTBookmarklet HTML fragment');
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

        openDialog: async function () {
            this.showDialog();
            try {
                this.answerfield.innerText = 'Contacting ChatGPT for summary...';
                const summary = await this.getSummary();
                this.answerfield.innerText = summary;
            } catch (e) {
                this.answerfield.innerText = 'Error: ' + e;
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
            return document.documentElement.innerText;
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
            const content = "```\n" + this.getIncludedText() + "\n``\n" +
                "=== Instructions ===\n" +
                "Please determine what language the text is written in, do not output that languabe but use it to create a summary of this text.";
            const messages = [{role: 'user', content: content}];
            const summary = await this.sendChatGPTRequest(messages);
            return summary;
        },

        getAnswer: async function (question, includePageContent) {
            const content = includePageContent ? this.getIncludedText() + "\n\nPlease answer the following question with regard to the previous text using the language the question is asked:\n" + question : question;
            const messages = [{role: 'user', content: content}];
            const answer = await this.sendChatGPTRequest(messages);
            return answer;
        },

        sendChatGPTRequest: async function (messages) {
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apikey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: messages,
                }),
            };

            let retries = 0;
            let response;

            while (retries < 3) {
                response = await fetch('https://api.openai.com/v1/chat/completions', requestOptions);

                if (response.status === 429) {
                    const retryAfterText = await response.text();
                    const retryAfterMatch = retryAfterText.match(/Please try again in (\d+)s\./);
                    if (retryAfterMatch) {
                        const retryAfter = parseInt(retryAfterMatch[1], 10);
                        await new Promise(resolve => setTimeout(resolve, (retryAfter + 1) * 1000));
                        retries++;
                    } else {
                        throw new Error('API limit exceeded, but retry time not found.');
                    }
                } else {
                    break;
                }
            }

            if (response.ok) {
                const data = await response.json();
                return data.choices[0].message.content;
            } else {
                throw new Error('Problem fetching data from ChatGPT API: ' + response.status + ' ' + response.statusText + ' ' + await response.text());
            }
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

    };

    window.hpsChatGPTBookmarklet = hpsChatGPTBookmarklet;
})();
