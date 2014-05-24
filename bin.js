#!/usr/bin/env node

var search    = require('./lib/search-and-analyze-readme');
var columnify = require('columnify');

var terms = process.argv.slice(2);

var options = {
  config: {
    name: { maxWidth: 40, truncate: false, truncateMarker: '' },
    description: { maxWidth: 60 }
  }
};

search(terms, function (err, packages) {
  var sortedPackages = packages.map(function (package) {
    return {
      name         : package.name,
      description  : package.description,
      score        : Math.floor((package.readmeScore.headers +
                      package.readmeScore.writing) * 50)
    };
  }).
  sort(function (a, b) {
    return b.score - a.score;
  });
  console.log(columnify(sortedPackages, options));
});
