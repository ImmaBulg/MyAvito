const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const parser = require('./Parser.js');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', function(req, res) {
    res.render('index');
})

app.post('/search', function(req, res) {
    var nots = [];
    parser.Parse('https://www.avito.ru/search', req.body, function(response, cp) {
        nots = response;
        res.render('search', { notices: nots });
    });
})

app.listen(3000, function() {
    console.log('Server is running on port 3000');
})