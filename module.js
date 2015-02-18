var request = require('request');

var token = "token "+process.env.OATH_TOKEN;

var hook = function(req,res,key){
	var localToken = ""
	if(key){
		localToken = "token "+key
	}else{
		localToken = token
	}
	res.send(200,'{"message":"ok","result":"ok"}');
	// TODO: Differentiate between github and bitbucket before processing payload.
	github(req.body, localToken);
}

var github = function(payload, localToken){
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
	parseTODOS(issueUrl,localToken,function(issueTodos){
		parseCommits(commitUrl,newChanges,localToken,function(commitTodos){
			var url = payload.repository.url
			var commitHash = payload.head_commit.id
			var blob_url = url+"/blob/"+commitHash
			var newIssues = compareTodo(issueTodos,commitTodos,localToken) 
			createIssues(issueUrl,blob_url,newIssues,localToken);
		})
	});

}
/**
 * Fetch and parse existing TODO issues from the repo
 *
 * @param {String} url
 * @param {function} cb
 */

var parseTODOS = function(url,localToken,cb){
	// TODO: state should be referenced in the incoming url
	request({url:url+"?state=all", headers: {'User-Agent': 'github-todo', "Authorization": localToken}}, function(err,res,body){
		var issues = JSON.parse(body);
		todos = []
		issues.forEach(function(issue,index){
			todos.push(issue);
		})
		cb(todos);
	}) }

/**
 * Fetch and parse TODOs out of commits' files
 */ 
var parseCommits = function(url,commits,localToken,cb){
	var comind = 0;
	todos = [];
  // TODO: replace commitDone counter with better loop logic
	var commitDone = function(){
		if(comind == 0){
			cb(todos);
		}
	}
	commits.forEach(function(commit,index){
		comind++
		var thisUrl = url+commit
		// TODO: break out to a seperate function to make more Bitbucket friendly
		request({url:thisUrl, headers: {'User-Agent': 'github-todo', "Authorization": localToken}}, function(err,res,body){
			// TODO: watch err and parse as needed. 
			var body = JSON.parse(body)
			if(body.type!="file"){
				comind--
				commitDone()
			}
			contents = new Buffer(body.content, 'base64');
			contents = contents.toString();
			lines = contents.split('\n')
			lines.forEach(function(line,index){
				if(line.indexOf('TODO:')>=0){
					todo = {};
					todo.title = line.split('TODO:')[1].trim()
					todo.line = index+1; todo.file=commit
					todos.push(todo);
				}
			})
			comind--
			commitDone()
		});
	})
};

/**
 * Compare TODOs between existing issues and new commits; return only new TODOs
 *
 * @param {Array} issues
 * @param {Array} commits
 */

var compareTodo = function(issues,commits,localToken){
	var newTODO = [];
	commits.forEach(function(issue,index){
		var found = false;
		issues.forEach(function(commit, index){
			if(commit.title == issue.title){
				found = true;
			}
		})
		if(!found){
			newTODO.push(issue);
		}
	});
	return newTODO;
}

/**
 * Create GitHub issues for every object in an array of issues
 *
 * @param {String} url
 * @param {String} blob_url
 * @param {Array} issues
 *
 * TODO: Make Bitbucket version
 */

var createIssues = function(url,blob_url,issues,localToken){
	issues.forEach(function(issue,index){
		var body = {title:issue.title,body:"File: "+blob_url+"/"+issue.file+"#L"+issue.line}
		request({url:url, method: 'POST', headers:{"User-Agent":"github-todo", "Authorization": localToken}, body:JSON.stringify(body)}, function(err,res,body){
		});
	})
};

exports.hook = hook

