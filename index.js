const express = require('express');
// deepcode ignore UseCsurfForExpress: CSRF is not a concern for this application
const app = express();
const port = 8000;
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const atbash = require('./ciphers/encode/atbash').atbashCipher();
const ceaser = require('./ciphers/encode/ceaser').ceaserCipher();
const fs = require('fs');


app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.disable('x-powered-by');
app.enable('Content-Security-Policy');
// implement a rate limiter
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50 // limit each IP to 50 requests per windowMs
});
app.use(limiter);

function responseHeaders() {
    return res.setHeader("Content-Security-Policy", "script-src 'self' https://unpkg.com/axios/dist/axios.min.js");
}
app.get('/', (req, res) => {
    res.setHeader("Content-Security-Policy", "script-src 'self' https://unpkg.com/axios/dist/axios.min.js");
    res.setHeader("Cross-Origin-Embedder-Policy", "coss-origin")
    res.sendFile(__dirname + '/site/index.html');
});
app.get('/main.js', (req, res) => {
    res.setHeader("Content-Security-Policy", "script-src 'self' https://unpkg.com/axios/dist/axios.min.js");
    res.sendFile(__dirname + '/site/main.js');
});
app.get('/new-cipher', (req, res) => {
    res.setHeader("Content-Security-Policy", "script-src 'self' https://unpkg.com/axios/dist/axios.min.js");
    //randomly choose a cipher
    var cipher = Math.floor(Math.random() * 2);
    //if cipher is 0, run atbash
    if (cipher == 0) {
        atbash();
        //grab the encoded string from data/atbash.json
        var encodedString = require('./data/atbash.json').encodedString;
        //send the encoded string to the client
        res.send(json.stringify(encodedString));
        // save the cipher to data/cipher.json
        var cipherObject = {
            "cipher": "atbash",
            "encodedString": encodedString
        };
        // run a try statement to see if data/cipher.json exists and if it does, delete it
        try {
            fs.unlinkSync('./data/cipher.json');
        } catch (err) {
            console.log(err);
        }
        try {
            fs.writeFileSync('./data/cipher.json', JSON.stringify(cipherObject));
        } catch (err) {
            console.log(err);
        }
    } else {
        //if cipher is 1, run ceaser
        ceaser();
        //grab the encoded string from data/ceaserShift.json
        var encodedString = require('./data/ceaserShift.json').encodedString;
        //send the encoded string to the client
        res.send(json.stringify(encodedString));
        //save the cipher to data/cipher.json
        var cipherObject = {
            "cipher": "ceaser",
            "encodedString": encodedString
        };
        // run a try statement to see if data/cipher.json exists and if it does, delete it
        try {
            fs.unlinkSync('./data/cipher.json');
        } catch (err) {
            console.log(err);
        }
        try {
            fs.writeFileSync('./data/cipher.json', JSON.stringify(cipherObject));
        } catch (err) {
            console.log(err);
        }
    }
});

app.post('/check-answer', (req, res) => {
    res.setHeader("Content-Security-Policy", "script-src 'self' https://unpkg.com/axios/dist/axios.min.js");
    //grab the answer from the client
    var answer = req.body.answer;
    //grab the string and cipher from data/cipher.json
    var string = require('./data/cipher.json').encodedString;
    var cipher = require('./data/cipher.json').cipher;
    //if the answer is correct, send true to the client
    if (answer == encodedString) {
        res.send(true);
    } else {
        //if the answer is incorrect, send false to the client
        res.send(false);
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
