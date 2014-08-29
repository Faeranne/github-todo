var express = require('express');
var app = express();
var bodyParser = require('body-parser')

app.use(bodyParser())

app.post('/hook', function(req,ref){
	console.log(req);
	res.send(200,'{"message":"ok","result":"ok"}');
});

app.listen(process.env.PORT);
