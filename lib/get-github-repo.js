var RE = /^(?:git@github.com:|(?:https?|git):\/\/github.com\/)(.+?\/.+?)(:?\.git)?$/;
module.exports = function (str) {
  var match = str.match(RE);
  return (match && match[1]) || null;
};
