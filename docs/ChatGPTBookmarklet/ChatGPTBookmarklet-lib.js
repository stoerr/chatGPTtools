/** The parts of the library that are helpers, rarely changed for a UI change. */
(function (window) {
    window.hpsChatGPTBookmarklet = window.hpsChatGPTBookmarklet || {};

    let recorder;
    let audioStream;
    let timeoutCall;
    let isRecording = false;
    let isStoppingRecording = false;

    /** Splits the message into words and replaces the middle 20% of the words by " ... [message truncated] ... " */
    function shortenMessage(message) {
        const words = message.split(/\b/);
        const start = Math.floor(words.length * 0.4) - 5;
        const end = Math.floor(words.length * 0.6) + 5;
        let result = words.slice(0, start).join('') + '\n... [message truncated] ...\n' + words.slice(end).join('');
        return result;
    }

    /** Escapes text so it is safe to insert into HTML. */
    function escapeHtml(text) {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    /**
     * Turns inline markdown (bold, italic, strikethrough, inline code, links) into HTML.
     * The input is escaped first so it can only ever produce safe HTML from the markdown syntax itself.
     * Links are extracted into placeholders so that URL characters (like underscores) cannot be mangled
     * by the later bold/italic processing.
     */
    function renderInline(text) {
        text = escapeHtml(text);
        const links = [];
        // links [text](url) - extract first so URLs aren't mangled by later inline rules
        text = text.replace(/\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
            function (match, label, url) {
                // only allow safe URL schemes
                if (!/^(https?:|mailto:|#|\/)/.test(url)) {
                    return match;
                }
                const placeholder = '\u0000LINK' + links.length + '\u0000';
                links.push('<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + label + '</a>');
                return placeholder;
            });
        // inline code `code` - protect from bold/italic markup inside
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        // bold **text** and __text__
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/__([^_]+)__/g, '<strong>$1</strong>');
        // italic *text* and _text_ (not bold, no surrounding letters)
        text = text.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
            .replace(/(^|[^_])_([^_\s][^_]*)_/g, '$1<em>$2</em>');
        // strikethrough ~~text~~
        text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');
        // restore the extracted links
        text = text.replace(/\u0000LINK(\d+)\u0000/g, function (match, index) {
            return links[parseInt(index, 10)];
        });
        return text;
    }

    /**
     * Converts a ChatGPT markdown answer into HTML for display. Content is escaped so only the
     * markdown syntax can produce tags (which are fixed and safe). Supports headings, lists,
     * blockquotes, fenced code blocks, inline code, bold/italic, links, horizontal rules and paragraphs.
     */
    function markdownToHtml(markdown) {
        const lines = markdown.replace(/\r\n/g, '\n').split('\n');
        const html = [];
        let i = 0;
        let inCodeBlock = false;
        let codeLang = '';
        let codeLines = [];
        const openLists = []; // stack of open list tags, e.g. ['<ul>', '<ol>']

        function closeCodeBlock() {
            if (inCodeBlock) {
                html.push('<pre><code>' + escapeHtml(codeLines.join('\n')) + '</code></pre>');
                codeLines = [];
                inCodeBlock = false;
            }
        }

        function closeLists() {
            while (openLists.length > 0) {
                html.push(openLists.pop().replace('<', '</'));
            }
        }

        /** Closes all open lists and opens a new list of the given tag. */
        function switchToLists(tag) {
            if (openLists.length === 1 && openLists[0] === tag) {
                return;
            }
            closeLists();
            html.push(tag);
            openLists.push(tag);
        }

        function flushParagraph(lines) {
            if (lines.length > 0) {
                html.push('<p>' + lines.map(renderInline).join('<br>') + '</p>');
                lines.length = 0;
            }
        }

        let paragraphLines = [];

        while (i < lines.length) {
            let line = lines[i];

            if (inCodeBlock) {
                if (/^```/.test(line)) {
                    closeCodeBlock();
                    codeLang = '';
                } else {
                    codeLines.push(line);
                }
                i++;
                continue;
            }

            if (/^```/.test(line)) {
                const m = line.match(/^```\s*(\S*)/);
                codeLang = m ? m[1] : '';
                closeLists();
                flushParagraph(paragraphLines);
                inCodeBlock = true;
                i++;
                continue;
            }

            // horizontal rule
            if (/^(\s*)(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
                closeLists();
                flushParagraph(paragraphLines);
                html.push('<hr>');
                i++;
                continue;
            }

            const heading = line.match(/^(#{1,6})\s+(.*)$/);
            if (heading) {
                closeLists();
                flushParagraph(paragraphLines);
                const level = heading[1].length;
                html.push('<h' + level + '>' + renderInline(heading[2]) + '</h' + level + '>');
                i++;
                continue;
            }

            // blockquote
            if (/^>/.test(line)) {
                closeLists();
                flushParagraph(paragraphLines);
                let quote = [];
                while (i < lines.length && /^>/.test(lines[i])) {
                    quote.push(lines[i].replace(/^>\s?/, ''));
                    i++;
                }
                html.push('<blockquote>' + quote.map(renderInline).join('<br>') + '</blockquote>');
                continue;
            }

            // bullet list
            const bullet = line.match(/^\s*[-*+]\s+(.*)$/);
            if (bullet && !/^```/.test(line)) {
                flushParagraph(paragraphLines);
                switchToLists('<ul>');
                html.push('<li>' + renderInline(bullet[1]) + '</li>');
                i++;
                continue;
            }

            // numbered list
            const numbered = line.match(/^\s*(\d+)\.\s+(.*)$/);
            if (numbered) {
                flushParagraph(paragraphLines);
                switchToLists('<ol>');
                html.push('<li>' + renderInline(numbered[2]) + '</li>');
                i++;
                continue;
            }

            // close lists on blank line or non-list content
            if (/^\s*$/.test(line)) {
                closeLists();
                flushParagraph(paragraphLines);
                i++;
                continue;
            }

            // plain paragraph line - also close open lists if we hit non-list content directly
            if (openLists.length > 0 && !/^\s*[-*+]\s/.test(line) && !/^\s*\d+\.\s/.test(line)) {
                closeLists();
            }
            paragraphLines.push(line);
            i++;
        }

        closeCodeBlock();
        closeLists();
        flushParagraph(paragraphLines);
        return html.join('\n');
    }

    var hpsChatGPTBookmarklet = {

        /**
         * Sends a chat request to the OpenAI ChatGPT API and retrieves the response.
         *
         * The method will automatically retry the request up to 3 times if the API rate limit has been exceeded,
         * waiting the required amount of time as specified in the API response.
         *
         * @param {Object[]} messages - The array of message objects to be sent to the ChatGPT API. Each object should have 'role' and 'content' properties.
         * @param {string} selectedModel - The name of the model to use for the request.
         * @param {number} maxTokens - The maximum number of tokens to generate.
         * @returns {Promise<string>} A promise that resolves to the content of the response message from the API.
         * @throws Will throw an error if the API limit is exceeded without a specified retry time or if there is a problem fetching data from the API.
         */
        sendChatGPTRequest: async function (messages, selectedModel = 'gpt-5-mini', maxTokens = 500) {
            // Use backend config if available
            const backend = window.hpsChatGPTBookmarklet && window.hpsChatGPTBookmarklet.getSelectedBackend
                ? window.hpsChatGPTBookmarklet.getSelectedBackend()
                : {
                    baseUrl: "https://api.openai.com/v1",
                    headers: [{ name: "Authorization", value: `Bearer ${this.apikey}` }]
                };
            const headers = {
                'Content-Type': 'application/json',
            };
            if (backend.headers) {
                backend.headers.forEach(h => headers[h.name] = h.value);
            }
            const url = backend.baseUrl + "/chat/completions";
            const requestOptions = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    model: selectedModel,
                    messages: messages,
                    max_completion_tokens: maxTokens,
                }),
            };

            let retries = 0;
            let response;

            while (retries < 3) {
                response = await fetch(url, requestOptions);

                if (response.status === 429) {
                    const retryAfterText = await response.text();
                    const retryAfterMatch = retryAfterText.match(/Please try again in (\d+)s\./);
                    if (retryAfterMatch) {
                        const retryAfter = parseInt(retryAfterMatch[1], 10);
                        await new Promise(resolve => setTimeout(resolve, (retryAfter + 1) * 1000));
                        retries++;
                    } else {
                        throw new Error('API limit exceeded, but retry time not found in ' + retryAfterText);
                    }
                } else {
                    break;
                }
            }

            if (response.ok) {
                const data = await response.json();
                return data.choices[0].message.content;
            } else {
                let responseText = await response.text();
                throw new Error('Problem fetching data from ChatGPT API: ' + response.status + ' ' + response.statusText + ' ' + responseText, {cause: responseText});
            }
        },

        /**
         * Sends a chat request to the OpenAI ChatGPT API and retrieves the response, clipping the largest part if
         * the limits of the model are exceeded.
         *
         * The method will automatically retry the request up to 3 times if the API rate limit has been exceeded,
         * waiting the required amount of time as specified in the API response.
         *
         * It the token limit is exceeded, the implementation will shorten the longest message by 10% until the limit
         * is no longer exceeded.
         *
         * @param {Object[]} messages - The array of message objects to be sent to the ChatGPT API. Each object should have 'role' and 'content' properties.
         * @param {function} isClippedCallback - A callback function (boolean argument) that will be used to indicate whether the message was clipped.
         * @param {string} selectedModel - The name of the model to use for the request.
         * @param {number} maxTokens - The maximum number of tokens to generate.
         * @returns {Promise<string>} A promise that resolves to the content of the response message from the API.
         * @throws Will throw an error if the API limit is exceeded without a specified retry time or if there is a problem fetching data from the API.
         */
        sendChatGPTRequestWithClipping(messages, isClippedCallback, selectedModel = 'gpt-5-mini', maxTokens = 5000) {
            const messageLengths = messages.map(message => message.content.length);
            const longestMessageIndex = messageLengths.indexOf(Math.max(...messageLengths));
            const longestMessage = messages[longestMessageIndex];
            var numberOfTriesLeft = 10;
            isClippedCallback(false);

            const sendRequest = async () => {
                try {
                    return await this.sendChatGPTRequest(messages, selectedModel, maxTokens);
                } catch (e) {
                    if (e.cause && e.cause.includes && e.cause.includes('Please reduce the length') &&
                        e.cause.includes('maximum context length') && numberOfTriesLeft > 0) {
                        isClippedCallback(true);
                        numberOfTriesLeft--;
                        longestMessage.content = shortenMessage(longestMessage.content);
                        return await sendRequest();
                    } else {
                        throw e;
                    }
                }
            };

            return sendRequest();
        },

        /**
         * Renders the given markdown text and displays it in the answer field. Links are made to open
         * in a new tab. Use this instead of setting answerfield.innerText to get proper markdown display.
         * The raw markdown is kept in this.lastAnswer so history can restore it without losing formatting.
         * @param {string} text - The markdown answer or plain text from ChatGPT.
         */
        setAnswer: function (text) {
            this.lastAnswer = text;
            this.answerfield.innerHTML = markdownToHtml(text);
        },

        /** Start recording */
        async startRecording() {
            if (!isRecording && !isStoppingRecording) {
                isRecording = true;
                console.log('Recording...');
                audioStream = await navigator.mediaDevices.getUserMedia({audio: true});
                const audioContext = new AudioContext();
                const input = audioContext.createMediaStreamSource(audioStream);
                recorder = new Recorder(input, {numChannels: 1});
                recorder.record();
                timeoutCall = setTimeout(this.stopRecording, 300000); // Stop recording after 5 minutes
            }
        },

        /** Stop recording and handle audio */
        async stopRecording(textarea, dictateButton, language) {
            if (!isRecording || isStoppingRecording) return;
            isStoppingRecording = true;
            console.log('Stopping recording');
            dictateButton.disabled = true;
            recorder.stop();
            clearTimeout(timeoutCall);
            audioStream.getTracks().forEach(track => track.stop());
            recorder.exportWAV(async (blob) => {
                const formData = new FormData();
                formData.append('file', blob);
                formData.append('model', 'whisper-1');
                if (language) {
                    formData.append('language', language);
                }
                // Optionally append the prompt
                const promptText = textarea.value.substring(0, textarea.selectionStart);
                formData.append('prompt', promptText);

                try {
                    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.apikey}`
                        },
                        body: formData
                    });
                    const data = await response.json();
                    if (response.ok) {
                        // Insert transcription at current cursor position
                        const cursorPosition = textarea.selectionStart;
                        const textBefore = textarea.value.substring(0, cursorPosition);
                        const textAfter = textarea.value.substring(cursorPosition);
                        textarea.value = `${textBefore}${/\s$/.test(textBefore) ? '' : ' '}${data.text}${/^\s/.test(textAfter) ? '' : ' '}${textAfter}`;
                        // set the cursor position just after the inserted text . Observe the possibly inserted space after textBefore, and before textAfter
                        textarea.selectionStart = cursorPosition + (/\s$/.test(textBefore) ? 0 : 1) + data.text.length + (/^\s/.test(textAfter) ? 0 : 1);
                        textarea.selectionEnd = textarea.selectionStart;
                    } else {
                        throw new Error(data.error);
                    }
                } catch (error) {
                    alert(`Error: ${error.message}`);
                } finally {
                    dictateButton.disabled = false;
                    recorder = null;
                    isRecording = false;
                    isStoppingRecording = false;
                }
            });
        }

    };

    Object.assign(window.hpsChatGPTBookmarklet, hpsChatGPTBookmarklet);
})(window);
