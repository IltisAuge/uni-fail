const express = require('express');
const Database = require('./database');

const server = express();
server.get('/api', (req, res) => {
    res.header('Content-Type', 'text/plain');
    res.send('Welcome on the /api endpoint!');
});

server.get('/api/hello', (req, res) => {
    res.header('Content-Type', 'text/plain');
    res.send('Hello World!');
});

server.listen(5010, () => {
    console.log('Server listening on port 5010');
})

const db = new Database();
db.connect();
