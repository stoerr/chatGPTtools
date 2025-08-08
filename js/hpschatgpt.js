'use strict';

// see also https://platform.openai.com/playground?mode=complete
// command line example:
// node suggestCommand.js "Write a bash command line to do the following: log the last 3 git commits"
// Needs an API key in ~/.openai-api-key.txt , see https://beta.openai.com/docs/api-reference/authentication
// Idea for a shellscript calling that. You could also add things to the prompt there.
// #!/bin/bash
// node "$(dirname "$(readlink -f "$0")")/suggestCommand.js" "$*"

const fs = require('fs');

// Read the API key from the file
const api_key = fs.readFileSync(`${process.env.HOME}/.openai-api-key.txt`, 'utf-8').trim();

/** Submits a message array via $.ajax to https://api.openai.com/v1/chat/completions .
 * @param messages array of  in the format {"role": type, "content": message}
 * @param resultcallback gets the data from the result
 * @param errorcallback in case of errors.
 * @param additionalProperties additional properties to be added to the request.
 * */
function submitToGPT(messages, resultcallback, errorcallback, additionalProperties) {

    async function makeCall(resultcb, errorcb) {
        const request = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + api_key,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "gpt-5-mini",
                user: 'chatgpt-fabian',
                messages: messages,
            }),
            signal: null,
        };

        if (additionalProperties) {
            for (const [key, value] of Object.entries(additionalProperties)) {
                request[key] = value;
            }
        }

        // Make up to 5 attempts if the response error code is 429. If there is any other error, abort.
        // find something like ' Please try again in 20s. ' in the response text , parse the number and retry after that many seconds, otherwise wait 20 seconds.
        let retryCount = 0;
        let retry = true;
        while (retry) {
            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', request);
                if (response.ok) {
                    const data = await response.json();
                    resultcb(data);
                    retry = false;
                } else {
                    if (response.status === 429 && retryCount < 5) {
                        retryCount++;
                        const text = await response.text();
                        const match = text.match(/Please try again in (\d+)s/);
                        let retryAfter = 20;
                        if (match) {
                            retryAfter = parseInt(match[1]);
                        }
                        console.error(`Got error ${response.status}, retrying after ${retryAfter} seconds`);
                        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                    } else {
                        errorcb(response);
                        retry = false;
                    }
                }
            } catch (error) {
                errorcb(error);
                retry = false;
            }
        }

    }

    return makeCall(resultcallback, errorcallback);
}

module.exports = { submitToGPT };
