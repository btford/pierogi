
var getGithubRepo   = require('./get-github-repo');
var getGithubReadme = require('./get-github-readme');
var searchNpm       = require('./search-npm');
var asyncMap        = require('async').map;

var addReadmeBodyToPackage = augment(getPackageReadme, 'readmeBody');

module.exports = function (terms, cb) {
  searchNpm(terms, function (err, packages) {
    if (err) {
      cb(err);
    } else {
      asyncMap(packages.map(addGithubInfoToPackage), addReadmeBodyToPackage, cb);
    }
  });
};

// cool function name, bro
function augment (fn, prop) {
  return function (arg, cb) {
    fn(arg, function (err, returns) {
      arg[prop] = returns;
      cb(err, arg);
    });
  };
}

function getPackageReadme (package, cb) {
  getGithubReadme(package.githubRepo, package.readmeFilename, cb);
}

function addGithubInfoToPackage (package) {
  package.githubRepo = package.repository &&
                       package.repository.url &&
                       getGithubRepo(package.repository.url);
  return package;
}
