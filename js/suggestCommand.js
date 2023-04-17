// see also https://platform.openai.com/playground?mode=complete
// command line example:
// node suggestCommand.js "Write a bash command line to do the following: log the last 3 git commits"
// Needs an API key in ~/.openaiapi , see https://beta.openai.com/docs/api-reference/authentication
// Idea for a shellscript calling that. You could also add things to the prompt there.
// #!/bin/bash
// node "$(dirname "$(readlink -f "$0")")/suggestCommand.js" "$*"

const hpschatgpt = require('./hpschatgpt.js');

// Read the prompt from the command line arguments starting from the third one.
var fileinput = "";
// console.log(process.argv);
var promptArray = process.argv.slice(2);

if (process.argv[2] === "-") {
    fileinput = require('fs').readFileSync(0, 'utf-8').trim() + "\n\n";
    promptArray = process.argv.slice(3);
} else if (process.argv[2] === "-f") {
    // complain if file does not exist
    if (!require('fs').existsSync(process.argv[3])) {
        console.error("File " + process.argv[3] + " does not exist.");
        process.exit(1);
    }
    fileinput = require('fs').readFileSync(process.argv[3], 'utf-8').trim() + "\n\n";
    promptArray = process.argv.slice(4);
}
var prompt = fileinput + promptArray.join(" ").trim();

const maxwords = 2500;
// if the prompt has more than maxwords words, shorten it by replacing the middle with "..."
let promptWords = prompt.split(" ");
if (promptWords.length > maxwords) {
    console.error("WARNING: Shortening prompt from " + promptWords.length + " to " + maxwords + " words.");
    const first = promptWords.slice(0, maxwords / 2).join(" ");
    const last = promptWords.slice(-maxwords / 2).join(" ");
    prompt = first + " ... " + last;
}

// console.log(prompt);

var messages = [{"role": "user", "content": prompt}];

function printResponse(response) {
    for (const choice of response.choices) {
        console.log(choice.message.content);
    }
}

function printError(error) {
    console.error(error);
}

hpschatgpt.submitToGPT(messages, printResponse, printError);
