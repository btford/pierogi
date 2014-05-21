
// these are poop
var RegClient = require('npm-registry-client');
var npmconf   = require('npmconf');
var request   = require('request');


// pass in the cli options that you read from the cli
// or whatever top-level configs you want npm to use for now.
function search (cb) {
  npmconf.load({}, function (er, conf) {

    var client = new RegClient({
      registry  : conf.get('registry'),
      cache     : conf.get('cache')
    });

    client.get('/-/all', 600, false, true, function (er, data) {
      return er ?
          cb(er) :
          cb(null, filter(data, ['connect']))
    });

  });
}

// from:
// https://github.com/npm/npm/blob/master/lib/search.js#L67
function filter (data, args, notArgs) {
  // data={<name>:{package data}}
  return Object.keys(data).map(function (d) {
    return data[d];
  }).
  filter(function (d) {
    return typeof d === "object";
  }).
  // map(stripData).
  map(getWords).
  filter(function (data) {
    return filterWords(data, args);
  });
  // reduce(function (l, r) {
  //   l[r.name] = r;
  //   return l;
  // }, {})
}

function getWords (data) {
  data.words = [ data.name ]
               .concat(data.description)
               .concat(data.maintainers)
               .concat(data.url && ("<" + data.url + ">"))
               .concat(data.keywords)
               .map(function (f) { return f && f.trim && f.trim() })
               .filter(function (f) { return f })
               .join(" ")
               .toLowerCase()
  return data
}

function filterWords (data, args) {
  var words = data.words
  for (var i = 0, l = args.length; i < l; i ++) {
    if (!match(words, args[i])) return false;
  }
  return true
}

function match (words, arg) {
  if (arg.charAt(0) === "/") {
    arg = arg.replace(/\/$/, "");
    arg = new RegExp(arg.substr(1, arg.length - 1));
    return words.match(arg);
  }
  return words.indexOf(arg) !== -1;
}

/*
function stripData (data) {
  return { name: data.name
         , description: npm.config.get("description") ? data.description : ""
         , maintainers: (data.maintainers || []).map(function (m) {
             return "=" + m.name
           })
         , url: !Object.keys(data.versions || {}).length ? data.url : null
         , keywords: data.keywords || []
         , version: Object.keys(data.versions || {})[0] || []
         , time: data.time
                 && data.time.modified
                 && (new Date(data.time.modified).toISOString()
                     .split("T").join(" ")
                     .replace(/:[0-9]{2}\.[0-9]{3}Z$/, ""))
                     .slice(0, -5) // remove time
                 || "prehistoric"
         }
}
*/


function githubMasterFileUrl (repo, file) {
  return githubFileUrl(repo, 'master', file);
}

function githubFileUrl (repo, sha, file) {
  return [ 'https://raw.githubusercontent.com', repo, sha, file ].join('/');
}

var RE = /^https:\/\/github.com\/(.+?\/.+?)\.git$/;

search(function (err, data) {
  data.forEach(function (data) {
    var match = data.repository &&
                data.repository.url &&
                data.repository.url.match(RE);

    var repo = match && match[1];
    if (repo && data.readmeFilename) {
      request(githubMasterFileUrl(repo, data.readmeFilename), function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(body) // Print the google web page.
        }
      })
    }
  })
})
