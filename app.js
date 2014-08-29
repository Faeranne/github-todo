var githubhook = require('githubhook');
var github = githubhook({port:process.env.PORT});


github.listen();

github.on('*', function (repo, ref, data) {
	console.log(data);
});
