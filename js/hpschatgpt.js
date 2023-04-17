'use strict';

// see also https://platform.openai.com/playground?mode=complete
// command line example:
// node suggestCommand.js "Write a bash command line to do the following: log the last 3 git commits"
// Needs an API key in ~/.openaiapi , see https://beta.openai.com/docs/api-reference/authentication
// Idea for a shellscript calling that. You could also add things to the prompt there.
// #!/bin/bash
// node "$(dirname "$(readlink -f "$0")")/suggestCommand.js" "$*"

const fs = require('fs');

// Read the API key from the file
const api_key = fs.readFileSync(`${process.env.HOME}/.openaiapi`, 'utf-8').trim();

/** Submits a message array via $.ajax to https://api.openai.com/v1/chat/completions .
 * @param messages array of  in the format {"role": type, "content": message}
 * @param resultcallback gets the data from the result
 * @param errorcallback in case of errors.
 * @param additionalProperties additional properties to be added to the request.
 * */
function submitToGPT(messages, resultcallback, errorcallback, additionalProperties) {

    /** Returns true if the error is retryable, i.e. we should retry after a while. */
    function isRetryableError(status) {
        return status === 429;
    }

    async function makeCall(resultcb, errorcb) {
        const request = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + api_key,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
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

        const controller = new AbortController();
        request.signal = controller.signal;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', request);
            if (response.ok) {
                const data = await response.json();
                resultcb(data);
            } else {
                errorcb(response);
            }
        } catch (error) {
            errorcb(error);
        }

        return controller;
    }

    return makeCall(resultcallback, errorcallback);

    // the retrialStrategy is not yet debugged for nodejs, and nodejs waits for quite a while before it finishes. I currently don't care enough.
    // return retrialStrategy(makeCall, isRetryableError, resultcallback, errorcallback);
}

/** Elaborate strategy to speed up things, since the API is wildly unpredictable in it's timing and sometimes we need
 * to retry because of the rate limit. We guarantee that either successCallback or errorCallback is called exactly once
 * in time, never both. So we will do several things here.
 * 1. we will make parallel calls after a while, up to 3, starting after 10 seconds and using iterative doubling of the time.
 * The first call that succeeds will abort all other calls.
 * 2. if one of the calls fails with an isRetryable error, we will also retry after that time, with iterative doubling.
 * @param function makeCall the function to call, which should return a promise with an .abort() function. It has the arguments successCallback and errorCallback.
 * It has to guarantee it will call either of them once in time, but not both.
 * @param function isRetryableError a function that takes the same arguments as the error callback and returns true if the error is retryable
 * @param function successCallback the success callback that is called once if one of the calls succeeds
 * @param function errorCallback the error callback that is called once if all calls fail
 */
function retrialStrategy(makeCall, isRetryable, successCallback, errorCallback) {
    const maxTries = 3;
    const maxInflightCalls = 2;
    var timeNextStep = 10000; // for iterative doubling
    var inflightCalls = []; // the results of makeCall which we could .abort() later
    var runningTimeout = null; // the timeout that will trigger the next step
    var done = false; // whether we have called either success or error callback
    var tries = 0;

    triggerCall();
    setTimeout(startNextStep, timeNextStep);

    function triggerCall() {
        if (tries >= maxTries) {
            console.log("Huh? " + tries + " retries.");
            return;
        }
        // console.log("Triggering call no. " + tries);
        tries += 1;
        let call = makeCall((...args) => onSuccess(call, tries, ...args), (...args) => onError(call, ...args));
        inflightCalls.push(call);
    }

    function onSuccess(call, tries, ...args) {
        if (inflightCalls.length > 1) {
            console.error("Success after " + tries + " tries, parallel " + inflightCalls.length);
        }
        inflightCalls = inflightCalls.filter(c => c !== call);
        if (!done) {
            done = true;
            cleanup();
            successCallback(...args);
        }
    }

    function onError(call, ...args) {
        inflightCalls = inflightCalls.filter(c => c !== call);
        if (!isRetryable(...args)) {
            console.log("Not retryable, aborting: " + JSON.stringify(args));
            if (!done) {
                done = true;
                cleanup();
                errorCallback(...args);
            }
        } else if (!done && inflightCalls.length === 0 && tries >= maxTries) {
            done = true;
            cleanup();
            errorCallback(...args);
        }
    }

    function startNextStep() {
        if (!done && inflightCalls.length < maxInflightCalls) {
            if (tries >= maxTries) {
                console.log("Giving up after " + tries + " retries.");
                return;
            }
            triggerCall();
            timeNextStep *= 2;
            runningTimeout = setTimeout(startNextStep, timeNextStep);
        }
    }

    function cleanup() {
        if (runningTimeout) {
            clearTimeout(runningTimeout);
        }
        runningTimeout = null;
        for (const call of inflightCalls) {
            call.abort();
        }
        inflightCalls = [];
    }
}

module.exports = { submitToGPT };
