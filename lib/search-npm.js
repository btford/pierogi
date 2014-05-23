/*
 * encapsulates npm APIs
 */

var RegClient = require('npm-registry-client');
var npmconf   = require('npmconf');

var filter = require('./filter-npm-search');

module.exports = function (terms, cb) {
  npmconf.load({}, function (er, conf) {
    var client = new RegClient({
      registry  : conf.get('registry'),
      cache     : conf.get('cache')
    });

    client.get('/-/all', 600, false, true, function (er, data) {
      return er ?
          cb(er) :
          cb(null, filter(data, terms))
    });
  });
};
