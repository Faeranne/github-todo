var express = require('express');
var app = express();
var bodyParser = require('body-parser')

app.use(bodyParser())

app.post('/hook', function(req,res){
	var commits = req.body.commits
	res.send(200,'{"message":"ok","result":"ok"}');
	commits.forEach(function(commit, index, commits){
		console.log(commit.id)
		console.log(commit.added);
		var issueUrl = req.body.repository.issues_url.replace('{/number}','');
		var commitUrl = req.body.repository.contents_url.replace('{+path}','');
		console.log(issueUrl);
		console.log(commitUrl);
	});
	
});


app.listen(process.env.PORT);
