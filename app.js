var githubhook = require('githubhook');
var github = githubhook({port:process.env.PORT});


github.listen();

github.on('event', function (repo, ref, data) {
	console.log(data);
});
