var readmeGood  = require('readme-good');
var packageGood = require('package-good');
var search      = require('./search-and-get-readme');

module.exports = function (terms, cb) {
  search(terms, function (err, packages) {
    (err && cb(err, null)) ||
        cb(null, packages.map(addReadmeAnalysis).
                          map(addPackageJsonAnalysis));
  });
};

function addReadmeAnalysis (package) {
  package.readmeScore = readmeGood(package.readmeBody || '');
  return package;
}

function addPackageJsonAnalysis (package) {
  package.packageScore = packageGood(package);
  return package;
}
