var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var requests = require('./request.js');

app.use(bodyParser())

app.post('/hook', function(req,res){
	res.send(200,'{"message":"ok","result":"ok"}');
	// TODO: Differentiate between github and bitbucket before processing payload.
	github(req.body);
});

var github = function(payload){
	// TODO: Only acknowledge pushes to the "Master" branch.
	// TODO: Create Bitbucket Function
	var commits = payload.commits
	newChanges = []
	commits.forEach(function(commit, index, commits){
		commit.added.forEach(function(add,id){
			if(!(newChanges.indexOf(add)>=0)){
				newChanges.push(add);
			}
		})
		commit.modified.forEach(function(add,id){
			if(!(newChanges.indexOf(add)>=0)){
				newChanges.push(add);
			}
		});
	});
	var issueUrl = payload.repository.issues_url.replace('{/number}','');
	var commitUrl = payload.repository.contents_url.replace('{+path}','');
	requests.parseTODOS(issueUrl,function(issueTodos){
		requests.parseCommits(commitUrl,newChanges,function(commitTodos){
			var url = payload.repository.url
			var commitHash = payload.head_commit.id
			var blob_url = url+"/blob/"+commitHash
			var newIssues = requests.compareTodo(issueTodos,commitTodos)
			requests.createIssues(issueUrl,blob_url,newIssues);
		})
	});

}

app.listen(process.env.PORT);

