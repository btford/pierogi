var readmeGood  = require('readme-good');
var packageGood = require('package-good');

module.exports = function (package) {
  package.readmeScore = readmeGood(package.readmeBody || '');
  package.packageScore = packageGood(package);

  package.score = Math.floor(100 / 3 *
                      (package.readmeScore.headers.score +
                      package.readmeScore.writing.score +
                      package.packageScore.maintainers.score));

  return package;
}
