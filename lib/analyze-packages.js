var analyze = require('./analyze');
var sort    = require('./sort-search-results');

module.exports = function (packages) {
  return sort(packages.map(analyze));
};
