/** The parts of the library that are helpers, rarely changed for a UI change. */
(function (window) {
    window.hpsChatGPTBookmarklet = window.hpsChatGPTBookmarklet || {};

    var hpsChatGPTBookmarklet= {

        /**
         * Sends a chat request to the OpenAI ChatGPT API and retrieves the response.
         *
         * The method will automatically retry the request up to 3 times if the API rate limit has been exceeded,
         * waiting the required amount of time as specified in the API response.
         *
         * @param {Object[]} messages - The array of message objects to be sent to the ChatGPT API. Each object should have 'role' and 'content' properties.
         * @returns {Promise<string>} A promise that resolves to the content of the response message from the API.
         * @throws Will throw an error if the API limit is exceeded without a specified retry time or if there is a problem fetching data from the API.
         */
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
        }

    };

    Object.assign(window.hpsChatGPTBookmarklet, hpsChatGPTBookmarklet);
})(window);
