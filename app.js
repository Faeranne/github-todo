var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var requests = require('./request.js');

app.use(bodyParser())

app.post('/hook', function(req,res){
	var commits = req.body.commits
	res.send(200,'{"message":"ok","result":"ok"}');
	newChanges = []
	commits.forEach(function(commit, index, commits){
		console.log(commit.id)
		commit.added.forEach(function(add,id){
			newChanges.push(add);
		})
		commit.modified.forEach(function(add,id){
			newChanges.push(add);
		});
	});
	var issueUrl = req.body.repository.issues_url.replace('{/number}','');
	var commitUrl = req.body.repository.contents_url.replace('{+path}','');
	requests.parseTODOS(issueUrl,function(issueTodos){
		requests.parseCommits(commitUrl,newChanges,function(commitTodos){
			console.log(issueTodos,commitTodos)
		})
	});
});


app.listen(process.env.PORT);
