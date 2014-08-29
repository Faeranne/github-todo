var request = require('request');

var parseTODOS = function(url,cb){
	request({url:url, headers: {'User-Agent': 'github-todo'}}, function(err,res,body){
		var issues = JSON.parse(body);
		todos = []
		issues.forEach(function(issue,index){
			issue.labels.forEach(function(label,index){
				if(label.name=="TODO"){
					todos.push(issue.title);
				}
			})
		})
		cb(todos);
	})
}

var parseCommits = function(url,commits,cb){
	var comind = 0;
	todos = [];
	var commitDone = function(){
		if(comind == 0){
			cb(todos);
		}
	}
	commits.forEach(function(commit,index){
		comind++
		var thisUrl = url+commit
		request({url:thisUrl, headers: {'User-Agent': 'github-todo'}}, function(err,res,body){
			var body = JSON.parse(body)
			console.log(body);
			if(body.type!="file"){
				comind--
				commitDone()
			}
			contents = new Buffer(body.content, 'base64');
			contents = contents.toString();
			lines = contents.split('\n')
			lines.forEach(function(line,index){
				if(line.indexOf('TODO:')>=0){
					todo = line.split('TODO:')[1].trim()
					todos.push(todo);
				}
			})
			comind--
			commitDone()
		});
	})
};

var compareTodo = function(issues,commits){
	var newTODO = [];
	issues.forEach(function(issue,index){
		var found = false;
		commits.forEach(function(commit, index){
			if(commit == issue){
				found = true;
			}
		})
		if(!found){
			newTODO.push(issue);
		}
	});
	return newTODO;
}

exports.parseTODOS = parseTODOS
exports.parseCommits = parseCommits
exports.compareTodo = compareTodo
