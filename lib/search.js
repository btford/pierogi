var searchNpm = require('./search-and-get-readme');
var analyzePackages = require('./analyze-packages');

module.exports = function (terms, npm, cb) {
  searchNpm(terms, npm, function (err, packages) {
    err ? cb(err) : cb(err, analyzePackages(packages));
  });
};
