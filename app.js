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
		commit.added.forEach(function(file, index, added){
			parseTODOS(req.body.repository.contents_url,file)
		})
	});
	
});

var parseTODOS = function(contentsUrl,file){
	console.log(contentsUrl);
	console.log(file);
}

app.listen(process.env.PORT);
