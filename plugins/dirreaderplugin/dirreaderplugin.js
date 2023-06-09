#!/usr/bin/env node
const fs = require('node:fs');
const execSync = require('node:child_process').execSync;
const spawnSync = require('node:child_process').spawnSync;
const http = require('node:http');
const server = http.createServer(processRequest);

const fixedFiles = {
    '/.well-known/ai-plugin.json': 'ai-plugin.json',
    '/dirreaderplugin.yaml': 'dirreaderplugin.yaml'
};

const scriptDir = __dirname;

/**
 * Processes a request.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function processRequest(req, res) {
    if (req.method !== 'GET') {
        res.writeHead(405, 'Method Not Allowed');
        return res.end();
    }

    console.log();
    console.log(`Request: ${req.method} ${req.url}`);
    // log headers one entry per line
    for (const [key, value] of Object.entries(req.headers)) {
        console.log(`${key}: ${value}`);
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    // if req.url is in fixedFiles, send that file
    if (req.url in fixedFiles) {
        sendfile(res, fixedFiles[req.url]);
        return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World\n');
}

function sendfile(res, filename) {
    fs.readFile(scriptDir + "/" + filename, 'utf8', (err, data) => {
        if (err) {
            console.error(filename, err);
            res.writeHead(404, 'Not Found');
            return res.end();
        }
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200, 'OK');
        res.end(data);
        console.log(`Sent ${filename}`);
    });
}

const port = 3000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
