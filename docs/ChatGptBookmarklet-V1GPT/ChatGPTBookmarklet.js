(function () {
    var hpsChatGPTBookmarklet = {
        basePath: '',
        dialog: null,

        init: async function (basePath) {
            this.basePath = basePath;

            await this.loadCSS();
            await this.loadHTML();

            document.getElementById('hpsChatGPTCloseTop').addEventListener('click', this.hideDialog.bind(this));
            document.getElementById('hpsChatGPTCloseBottom').addEventListener('click', this.hideDialog.bind(this));
            document.getElementById('hpsChatGPTSubmit').addEventListener('click', this.submitQuestion.bind(this));
            document.getElementById('hpsChatGPTCopyToClipboard').addEventListener('click', this.copyToClipboard.bind(this));
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

        loadHTML: async function () {
            const response = await fetch(this.basePath + '/ChatGPTBookmarklet.html');

            if (response.ok) {
                const html = await response.text();
                this.dialog = document.createElement('div');
                this.dialog.innerHTML = html;
                document.body.appendChild(this.dialog);
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
            const summary = await this.getSummary();
            document.getElementById('hpsChatGPTAnswer').innerText = summary;
        },

        submitQuestion: async function () {
            const question = document.getElementById('hpsChatGPTQuestion').value;
            const includePageContent = document.getElementById('hpsChatGPTIncludePageContent').checked;

            if (question.trim() !== '') {
                document.getElementById('hpsChatGPTAnswer').innerText = 'Thinking...';
                const answer = await this.getAnswer(question, includePageContent);
                document.getElementById('hpsChatGPTAnswer').innerText = answer;
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

        copyToClipboard: function () {
            const answer = document.getElementById('hpsChatGPTAnswer');
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
            const content = (this.getSelectedText() || this.getPageContent()) + "\n\nTL;DR:";
            const messages = [{role: 'user', content: content}];
            const summary = await this.sendChatGPTRequest(messages);
            return summary;
        },

        getAnswer: async function (question, includePageContent) {
            const content = includePageContent ? (this.getSelectedText() || this.getPageContent()) + "\n\nPlease answer the following question with regard to the previous text: " + question : question;
            const messages = [{role: 'user', content: content}];
            const answer = await this.sendChatGPTRequest(messages);
            return answer;
        },

        getAPIKey: function () {
            let apiKey = localStorage.getItem('openai_api_key');
            if (!apiKey) {
                apiKey = prompt('Please enter your ChatGPT API key:');
                if (apiKey) {
                    localStorage.setItem('chatgpt_api_key', apiKey);
                } else {
                    console.error('API key is required for ChatGPT');
                }
            }
            return apiKey;
        },

        sendChatGPTRequest: async function (messages) {
            const apiKey = await this.getAPIKey();
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-5.1-mini',
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
                throw new Error('Error fetching data from ChatGPT API');
            }
        },

    };

    window.hpsChatGPTBookmarklet = hpsChatGPTBookmarklet;
})();
