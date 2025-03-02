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
        sendChatGPTRequest: async function (messages, selectedModel = 'gpt-4o-mini', maxTokens = 500) {
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apikey}`,
                },
                body: JSON.stringify({
                    model: selectedModel,
                    messages: messages,
                    max_completion_tokens: maxTokens,
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
        sendChatGPTRequestWithClipping(messages, isClippedCallback, selectedModel = 'gpt-4o-mini', maxTokens = 5000) {
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
