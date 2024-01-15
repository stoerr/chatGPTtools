/** The parts of the library that are helpers, rarely changed for a UI change. */
(function (window) {
    window.hpsChatGPTBookmarklet = window.hpsChatGPTBookmarklet || {};

    /** Splits the message into words and replaces the middle 10% of the words by " ... [message truncated] ... " */
    function shortenBy10Percent(message) {
        const words = message.split(/\b/);
        const start = Math.floor(words.length * 0.45) - 5;
        const end = Math.floor(words.length * 0.55) + 5;
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
        sendChatGPTRequest: async function (messages, selectedModel = 'gpt-3.5-turbo', maxTokens = 500) {
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apikey}`,
                },
                body: JSON.stringify({
                    model: selectedModel,
                    messages: messages,
                    max_tokens: maxTokens,
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
        sendChatGPTRequestWithClipping(messages, isClippedCallback, selectedModel = 'gpt-3.5-turbo', maxTokens = 500) {
            const messageLengths = messages.map(message => message.content.length);
            const longestMessageIndex = messageLengths.indexOf(Math.max(...messageLengths));
            const longestMessage = messages[longestMessageIndex];
            var numberOfTriesLeft = 10;
            isClippedCallback(false);

            const sendRequest = async () => {
                try {
                    return await this.sendChatGPTRequest(messages, selectedModel);
                } catch (e) {
                    if (e.cause && e.cause.includes && e.cause.includes('Please reduce the length') &&
                        e.cause.includes('maximum context length') && numberOfTriesLeft > 0) {
                        isClippedCallback(true);
                        numberOfTriesLeft--;
                        longestMessage.content = shortenBy10Percent(longestMessage.content);
                        return await sendRequest();
                    } else {
                        throw e;
                    }
                }
            };

            return sendRequest();
        }

    };

    Object.assign(window.hpsChatGPTBookmarklet, hpsChatGPTBookmarklet);
})(window);
