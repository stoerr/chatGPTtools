// command line example:
// node applyTemplate.js <templatename> <inputfile>
// Needs an API key in ~/.openaiapi , see https://beta.openai.com/docs/api-reference/authentication
// #!/bin/bash
// node "$(dirname "$(readlink -f "$0")")/applyTemplate.js" "$@"

const hpschatgpt = require('./hpschatgpt.js');
const fs = require('fs');

var templateName = __dirname + '/../templates/' + process.argv[2] + ".json";
var inputFile = process.argv[3];

// read json from ../templates/<templateName>.json
// looks like [{ "role": "system", "message" : "something" }, { "role": "user", "message" : "bla FILECONTENT blu" }]
var messages = JSON.parse(fs.readFileSync(templateName, 'utf-8'));

// read input from inputFile
var input = fs.readFileSync(inputFile, 'utf-8');

const placeholder = "FILECONTENT";
const filenamePlaceholder = "FILENAME";
inputFile = inputFile.replace(".pdf.txt", ".pdf");

// replace placeholder in message with input
for (const message of messages) {
    if (message.role === "user") {
        message.content = message.content.replace(placeholder, input).replace(filenamePlaceholder, inputFile);
    }
}

function printResponse(response) {
    for (const choice of response.choices) {
        console.log(choice.message.content);
        process.exit(0);
    }
}

function printError(error) {
    console.error(error);
    console.error("For messages:");
    console.error(messages);
    process.exit(1);
}

hpschatgpt.submitToGPT(messages, printResponse, printError, {temperature: 0.0});
