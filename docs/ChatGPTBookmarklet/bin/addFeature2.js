#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const util = require('util');
const cp = require('child_process');
//  const {exec} = require('child_process');
//  const execAsync = util.promisify(exec);

/** executes the command line (array of string) and returns the stdout. If the exit code is not 0, we throw an error. */
function execCmd(program, args, stdin = "") {
    return cp.execFileSync(program, args, {encoding: 'utf-8', input: stdin});
}

// console.log(execCmd("./hpsxprintargs", ['hal"lo', "hallo"]));

/** An "agent" that is able to answer questions about the files he is responsible for, and is able to modify the main file. */
function agent(name, mainFile, additionalFiles) {
    return {
        apply : function (instructions) {
            console.log(name, ": " , instructions, " == ", arguments);
        },

        description : `
    -   name: ${name}
        mainFile: ${mainFile}
        readonlyFiles: ${additionalFiles.join(' ')}
        capabilities: Can read and write ${mainFile} and 
`
    };
}
