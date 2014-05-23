var request = require('request');

module.exports = function (repo, file, cb) {
  if (!repo || !file) {
    process.nextTick(function () {
      cb(null, '');
    });
  } else {
    request(githubMasterFileUrl(repo, file), function (error, response, body) {
      if (!error && response.statusCode == 200) {
        cb(null, body);
      } else {
        cb(error);
      }
    });
  }
};

function githubMasterFileUrl (repo, file) {
  return githubFileUrl(repo, 'master', file);
}

function githubFileUrl (repo, sha, file) {
  return [ 'https://raw.githubusercontent.com', repo, sha, file ].join('/');
}
