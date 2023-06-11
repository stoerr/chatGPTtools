#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const execSync = require('node:child_process').execSync;
const spawnSync = require('node:child_process').spawnSync;
const http = require('node:http');
const url = require('node:url');
const server = http.createServer(processRequest);

const fixedFiles = {
    '/.well-known/ai-plugin.json': 'ai-plugin.json',
    '/testplugin.yaml': 'testplugin.yaml'
};

const scriptDir = __dirname;

/**
 * Processes a request.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function processRequest(req, res) {
    console.log(`Request: ${req.method} ${req.url}`);

    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');
        if (req.headers['access-control-request-headers']) {
            res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
        }
        res.setHeader('Access-Control-Max-Age', '86400');
        res.setHeader('Allow', '*');
        res.writeHead(200);
        res.end();
        return;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store');

    const reqUrl = url.parse(req.url, true);

    if (reqUrl.pathname in fixedFiles) {
        sendfile(res, fixedFiles[reqUrl.pathname]);
    } else {
        // for (const header in req.headers)  console.log(`${header}: ${req.headers[header]}`);
        console.log(`Content-Type: ${req.headers['content-type']}`);
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            console.log(body);
            res.writeHead(200, 'OK');
            const msg = "Thank you for your request!\nQuery " + JSON.stringify(reqUrl.query) + "\nBody:\n" + body + "\n\n";
            console.log(msg);
            res.end(msg);
        });
    }
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

const port = 3010;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
