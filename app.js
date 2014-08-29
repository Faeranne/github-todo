var express = require('express');
var app = express();
var bodyParser = require('body-parser')

app.use(bodyParser())

app.post('/hook', function(req,res){
	var commits = req.body.commits
	commits.forEach(function(commit, index, commits){
		console.log(commit.id)
		console.log(commit.added);
	});
	res.send(200,'{"message":"ok","result":"ok"}');
});

app.listen(process.env.PORT);
