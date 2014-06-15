#!/usr/bin/env node

var search    = require('./lib/search');
var view      = require('./lib/view');
var output    = require('./lib/output-search');
var npmClient = require('./lib/npm-client');

var terms = process.argv.slice(2);

var actions = {
  lint: function (err, npm) {
    view(terms, npm, function (err, out) {
      console.log(out.name + ': ' + out.score + '/100');
      printScore(out.readmeScore);
      printScore(out.packageScore);
    });
  },

  search: function (err, npm) {
    search(terms, npm, function (err, packages) {
      err ? console.log(err) : output(packages);
    });
  }
};

var action;

if ((action = terms.length && terms.shift()) && actions[action]) {
  npmClient(actions[action]);
} else {
  console.log('action' + (action ? (' "' + action + '"') : '') + ' not found');
  process.exit(1);
}

function printScore (score) {
  Object.keys(score).forEach(function (criteria) {
    if (score[criteria].suggestions && score[criteria].suggestions.length > 0) {
      console.log(' ' + criteria);
      score[criteria].suggestions.forEach(function (suggestion) {
        console.log('  - ' + (typeof suggestion === 'object' ? suggestion.reason : suggestion));
      });
    }
  });
}
