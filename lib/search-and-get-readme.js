
var addReadmeBodyToPackage = require('./add-readme-to-package');
var searchNpm              = require('./search-npm');
var asyncMap               = require('async').map;

module.exports = function (terms, npm, cb) {
  searchNpm(terms, npm, function (err, packages) {
    if (err) {
      cb(err);
    } else {
      asyncMap(packages, addReadmeBodyToPackage, cb);
    }
  });
};
