#!/usr/bin/env node
const http = require('node:http');
const server = http.createServer(processRequest);

/**
 * Processes a request.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function processRequest(req, res) {
    if (req.method === 'OPTIONS') {
        res.writeHead(405, 'Method Not Allowed');
        return res.end();
    }

    console.log();
    console.log(`Request: ${req.method} ${req.url}`);
    // log headers one entry per line
    for (const [key, value] of Object.entries(req.headers)) {
        console.log(`${key}: ${value}`);
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World\n');
}

const port = parseInt(process.argv[2]);

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
