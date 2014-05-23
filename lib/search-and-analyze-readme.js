var readmeGood = require('readme-good');
var search     = require('./search-and-get-readme');

module.exports = function (terms, cb) {
  search(terms, function (err, packages) {
    (err && cb(err, null)) || cb(null, packages.map(addReadmeAnalysis));
  });
};

function addReadmeAnalysis (package) {
  package.readmeScore = readmeGood(package.readmeBody || '');
  return package;
}
