/*
 * load npm config and create a client
 */

var RegClient = require('npm-registry-client'),
    npmconf   = require('npmconf');

module.exports = function (cb) {
  npmconf.load({}, function (err, config) {
    cb(err, err ? null : {
      config: config,
      color: true,
      client: new RegClient({
        registry  : config.get('registry'),
        cache     : config.get('cache')
      })
    });
  });
};
