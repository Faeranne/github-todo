var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var requests = require('./request.js');

app.use(bodyParser())

app.post('/hook', function(req,res){
	var commits = req.body.commits
	// TODO: Only acknowledge pushes to the "Master" branch.
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
	console.log(req.body.repository.contents_url)
	console.log(newChanges);
	var issueUrl = req.body.repository.issues_url.replace('{/number}','');
  // TODO: pass contents_url to parseCommits to create commitUrl
  // TODO: Track down bug preventing pull requests from being lost to some unknown error
	var commitUrl = req.body.repository.contents_url.replace('{+path}','');
	requests.parseTODOS(issueUrl,function(issueTodos){
		requests.parseCommits(commitUrl,newChanges,function(commitTodos){
			var newIssues = requests.compareTodo(issueTodos,commitTodos)
			console.log(newIssues)
			requests.createIssues(issueUrl,newIssues);
		})
	});
});


app.listen(process.env.PORT);
