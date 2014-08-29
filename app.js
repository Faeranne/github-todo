var express = require('express');
var app = express();
var bodyParser = require('body-parser')

app.use(bodyParser())

app.post('/hook', function(req,res){
	console.log(req);
	res.send(200,'{"message":"ok","result":"ok"}');
});

app.listen(process.env.PORT);
