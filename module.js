const request = require('request');
const express = require('express');

var router = express.Router();
var token = `token ${process.env.OATH_TOKEN}`

router.post('/', (req, res) => {
    var localToken = key ? "token " + key : token;
    res.status(200).json({ message: 'ok', result: 'ok' });
    // TODO: Differentiate between github and bitbucket before processing payload.
    github(req.body, localToken);
});

/**
 * GitHub handler for a commit
 * @param {any} payload
 * @param {string} localToken
 */
function github(payload, localToken) {
    // TODO: Only acknowledge pushes to the "Master" branch.
    var commits = payload.commits;
    var newChanges = [];
    commits.forEach((commit, index, commits) => {
        commit.added.forEach((add) => {
            if (newChanges.indexOf(add) <= 0) 
                newChanges.push(add);
        })
        commit.modified.forEach((add) => {
            if (newChanges.indexOf(add) <= 0) 
                newChanges.push(add);
        });
    });

    var issueUrl = payload.repository.issues_url.replace('{/number}', '');
    var commitUrl = payload.repository.contents_url.replace('{+path}', '');
    parseTODOS(issueUrl, localToken, (issueTodos) => {
        parseCommits(commitUrl, newChanges, localToken, (commitTodos) => {
            var url = payload.repository.url;
            var commitHash = payload.head_commit.id;
            var blob_url = url + "/blob/" + commitHash;
            var newIssues = compareTodo(issueTodos, commitTodos, localToken);
            createIssues(issueUrl, blob_url, newIssues, localToken);
        })
    });
}

/**
 * BitBucket handler for a commit
 * @param {any} payload
 * @param {string} localToken
 */
function BitBucker(payload, localToken) {
    // TODO: Create Bitbucket Function
}

/**
 * Fetch and parse existing TODO issues from the repo
 * @param {string} url
 * @param {string} localToken
 * @param {function} cb
 */
function parseTODOS(url, localToken, cb) {
    // TODO: state should be referenced in the incoming url
    request({ url: url + "?state=all", headers: { 'User-Agent': 'github-todo', "Authorization": localToken } }, (err, res, body) => {
        var todos = [];
        JSON.parse(body).forEach(function (issue, index) {
            todos.push(issue);
        })
        cb(todos);
    })
}

/**
 * Fetch and parse TODOs out of commits' files
 * @param {string} url
 * @param {any[]} commits
 * @param {string} localToken
 * @param {function} cb
 */
function parseCommits(url, commits, localToken, cb) {
    var comind = 0;
    var todos = [];
    // TODO: replace commitDone counter with better loop logic
    function commitDone() {
        if (comind == 0) {
            cb(todos);
        }
    }
    commits.forEach((commit) => {
        comind++;
        var thisUrl = url + commit;
        // TODO: break out to a seperate function to make more Bitbucket friendly
        request({ url: thisUrl, headers: { 'User-Agent': 'github-todo', "Authorization": localToken } }, (err, res, body) => {
            // TODO: watch err and parse as needed. 
            var body = JSON.parse(body);
            if (body.type != "file") {
                comind--;
                commitDone();
            }
            var lines = new Buffer(body.content, 'base64')
                .toString()
                .split('\n');
            lines.forEach((line, index) => {
                if (line.indexOf('TODO:') >= 0)
                    todos.push({
                        title: line.split('TODO:')[1].trim(),
                        line: index + 1,
                        file: commit
                    });
            });

            comind--;
            commitDone();
        });
    })
}

/**
 * Compare TODOs between existing issues and new commits; return only new TODOs
 * @param {any[]} issues
 * @param {any[]} commits
 * @param {string} localToken
 */
function compareTodo(issues, commits, localToken) {
    return commits.map((issue) => {
        if (issues.filter((v) => v.title == issue.title).length <= 0)
            return issue;
        });
}

// TODO: Make Bitbucket version
/**
 * Create GitHub issues for every object in an array of issues
 * @param {string} url
 * @param {string} blob_url
 * @param {any[]} issues
 */
function createIssues(url, blob_url, issues, localToken) {
    issues.forEach((issue, index) => {
        var body = {
            title: issue.title,
            body: `File: ${blob_url}/${issue.file}#L${issue.line}`
        }
        request({
            url: url,
            method: 'POST',
            headers: { "User-Agent": "github-todo", "Authorization": localToken },
            body: JSON.stringify(body)
        }, (err, res, body) => {
            // TODO: i think here should be something
        });
    })
}

module.exports = router;