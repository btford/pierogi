
module.exports = function sort (packages) {
  return packages.map(function (package) {
    return {
      name         : package.name,
      description  : package.description,
      score        : package.score
    };
  }).
  sort(function (a, b) {
    return b.score - a.score;
  });
}
