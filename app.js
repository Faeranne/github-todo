var express = require('express');
var bodyParser = require('body-parser')
var module = require('./module.js');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/hook', module);

app.listen(process.env.PORT || 3000);
console.log('Issue Bot Started!');