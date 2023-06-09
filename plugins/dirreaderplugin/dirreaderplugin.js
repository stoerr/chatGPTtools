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
    '/dirreaderplugin.yaml': 'dirreaderplugin.yaml'
};

const scriptDir = __dirname;

/**
 * Processes a request.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function processRequest(req, res) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
        res.setHeader('Access-Control-Max-Age', '86400');
        res.setHeader('Allow', '*');
        res.writeHead(200);
        res.end();
        return;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store');

    const reqUrl = url.parse(req.url, true);

    console.log(`Request: ${req.method} ${reqUrl.pathname}`);

    switch (reqUrl.pathname) {
        case '/thought':
            if (req.method !== 'POST') {
                res.writeHead(405, 'Method Not Allowed');
                return res.end();
            }
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                console.log(body);
                res.writeHead(200, 'OK');
                res.end();
            });
            break;
        case '/list':
            if (req.method !== 'GET') {
                res.writeHead(405, 'Method Not Allowed');
                return res.end();
            }
            const files = listFiles(
                reqUrl.query.directorypath,
                reqUrl.query.recursive
            );
            res.writeHead(200, 'OK');
            res.end(JSON.stringify(files));
            break;
        case '/read':
            if (req.method !== 'GET') {
                res.writeHead(405, 'Method Not Allowed');
                return res.end();
            }
            const content = readFileContent(reqUrl.query.path);
            res.writeHead(200, 'OK');
            res.end(content);
            break;
        default:
            if (reqUrl.pathname in fixedFiles) {
                sendfile(res, fixedFiles[reqUrl.pathname]);
            } else {
                res.writeHead(404, 'Not Found');
                res.end();
            }
            break;
    }
}

function listFiles(directoryPath, recursive = true) {
    const filesInfo = [];

    function walk(directory) {
        const files = fs.readdirSync(directory);

        for (const file of files) {
            const fullPath = path.join(directory, file);
            const stats = fs.statSync(fullPath);

            if (stats.isDirectory()) {
                if (recursive) {
                    walk(fullPath);
                }
            } else {
                filesInfo.push({
                    name: fullPath,
                    size: stats.size,
                    creationDate: stats.birthtime.toISOString(),
                    lastModifiedDate: stats.mtime.toISOString()
                });
            }
        }
    }

    walk("." + directoryPath);
    console.log(filesInfo);
    return filesInfo;
}

function readFileContent(path) {
    if (path.contains('..')) {
        throw new Error('Invalid path');
    }
    try {
        const data = fs.readFileSync(path, 'utf8');
        return data;
    } catch (err) {
        console.error(err);
        return '';
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

const port = 3000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
