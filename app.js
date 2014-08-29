var githubhook = require('githubhook');
var github = githubhook();


github.listen();

github.on('event', function (repo, ref, data) {
	console.log(data);
});
