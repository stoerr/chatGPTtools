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
            // Add your ChatGPT API call here to get the summary
            // document.getElementById('hpsChatGPTSummary').innerText = "This is a summary of the page.";
            return "This is a summary of the page.";
        },

        getAnswer: async function (question, includePageContent) {
            // Add your ChatGPT API call here to get the answer to the question
            // document.getElementById('hpsChatGPTAnswer').innerText =
            return "This is an answer to the question " + question + " includecontent " + includePageContent;
        },

    };

    window.hpsChatGPTBookmarklet = hpsChatGPTBookmarklet;
})();
