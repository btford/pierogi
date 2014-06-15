var columnify = require('columnify');

var options = {
  config: {
    name: { maxWidth: 40, truncate: false, truncateMarker: '' },
    description: { maxWidth: 60 }
  }
};

module.exports = function (packages) {
  console.log(columnify(packages, options));
};
