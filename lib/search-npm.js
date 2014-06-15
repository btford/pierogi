var filter = require('./filter-npm-search');

module.exports = function (terms, npm, cb) {
  npm.client.get('/-/all', 600, false, true, function (err, data) {
    return err ? cb(err) : cb(null, filter(data, terms))
  });
};
