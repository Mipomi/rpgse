const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/data/akun.json', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'akun.json'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading file');
            return;
        }
        res.send(data);
    });
});

app.post('/data/akun.json', (req, res) => {
    fs.writeFile(path.join(__dirname, 'data', 'akun.json'), JSON.stringify(req.body, null, 2), (err) => {
        if (err) {
            res.status(500).send('Error writing file');
            return;
        }
        res.send('File updated');
    });
});

app.get('/data/monster.json', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'monster.json'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading file');
            return;
        }
        res.send(data);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
