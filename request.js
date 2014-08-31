var request = require('request');

var token = "token "+process.env.OATH_TOKEN;

/**
 * Fetch and parse existing TODO issues from the repo
 *
 * @param {String} url
 * @param {function} cb
 */

var parseTODOS = function(url,cb){
	// TODO: state should be referenced in the incoming url
	request({url:url+"?state=all", headers: {'User-Agent': 'github-todo'}}, function(err,res,body){
		var issues = JSON.parse(body);
		todos = []
		issues.forEach(function(issue,index){
			todos.push(issue.title);
		})
		cb(todos);
	})
}

/**
 * Fetch and parse TODOs out of commits' files
 */

var parseCommits = function(url,commits,cb){
	todos = [];
	commits.forEach(function(commit,commitIndex){
		var thisUrl = url+commit
		request({url:thisUrl, headers: {'User-Agent': 'github-todo'}}, function(err,res,body){
			// TODO: watch err and parse as needed. 
			var body = JSON.parse(body)
			if(body.type!="file"){
        return;
			}
			contents = new Buffer(body.content, 'base64');
			contents = contents.toString();
			lines = contents.split('\n')
			lines.forEach(function(line,lineIndex){
				if(line.indexOf('TODO:')>=0){
					todo = line.split('TODO:')[1].trim()
					todos.push(todo);
				}
			})
		});
    cb(todos);
	})
};

/**
 * Compare TODOs between existing issues and new commits; return only new TODOs
 *
 * @param {Array} issues
 * @param {Array} commits
 */

var compareTodo = function(issues,commits){
	var newTODO = [];
	commits.forEach(function(issue,index){
		var found = false;
		issues.forEach(function(commit, index){
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

/**
 * Create GitHub issues for every object in an array of issues
 *
 * @param {String} url
 * @param {Array} issues
 */

var createIssues = function(url,issues){
	issues.forEach(function(issue,index){
    // TODO: Include a link to file & line number in issue body
		var body = {title:issue}
		request({url:url, method: 'POST', headers:{"User-Agent":"github-todo", "Authorization": token}, body:JSON.stringify(body)}, function(err,res,body){
		});
	})
};

exports.parseTODOS = parseTODOS
exports.parseCommits = parseCommits
exports.compareTodo = compareTodo
exports.createIssues = createIssues


