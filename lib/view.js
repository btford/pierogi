
/*
 * encapsulates npm APIs
 */

var url       = require('url'),
    util      = require('util'),
    semver    = require('semver');

var addReadmeBodyToPackage = require('./add-readme-to-package');
var analyze = require('./analyze');

module.exports = function (args, npm, cb) {
  var pkg = args.shift(),
      nv = pkg.split('@'),
      name = nv.shift(),
      version = nv.join('@') || npm.config.get("tag")

  if (name === '.') {
    return cb(view.usage);
  }

  // get the data about this package
  var uri = url.resolve(npm.config.get("registry"), name)
  npm.client.get(uri, null, function (er, data) {
    if (er) {
      return cb(er);
    }
    if (data["dist-tags"] && data["dist-tags"].hasOwnProperty(version)) {
      version = data["dist-tags"][version];
    }

    if (data.time && data.time.unpublished) {
      var u = data.time.unpublished
      er = new Error("Unpublished by " + u.name + " on " + u.time)
      er.statusCode = 404
      er.code = "E404"
      er.pkgid = data._id
      return cb(er, data);
    }

    var results = []
      , error = null
      , versions = data.versions || {};

    data.versions = Object.keys(versions).sort(semver.compareLoose)
    if (!args.length) args = [""]

    // remove readme unless we asked for it
    if (-1 === args.indexOf("readme")) {
      delete data.readme
    }

    Object.keys(versions).forEach(function (v) {
      if (semver.satisfies(v, version, true)) args.forEach(function (args) {
        // remove readme unless we asked for it
        if (-1 === args.indexOf("readme")) {
          delete versions[v].readme
        }
        results.push(showFields(data, versions[v], args))
      });
    });
    results = results.reduce(reducer, {})
    var retval = results

    if (args.length === 1 && args[0] === "") {
      retval = cleanBlanks(retval)
    }

    addReadmeBodyToPackage(data, function (err, package) {
      cb(err, err ? null : analyze(package));
    });

  });
};

function cleanBlanks (obj) {
  var clean = {}
  Object.keys(obj).forEach(function (version) {
    clean[version] = obj[version][""]
  })
  return clean
}

function reducer (l, r) {
  if (r) Object.keys(r).forEach(function (v) {
    l[v] = l[v] || {}
    Object.keys(r[v]).forEach(function (t) {
      l[v][t] = r[v][t]
    })
  })
  return l
}

// return whatever was printed
function showFields (data, version, fields) {
  var o = {}
  ;[data, version].forEach(function (s) {
    Object.keys(s).forEach(function (k) {
      o[k] = s[k]
    })
  })
  return search(o, fields.split("."), version.version, fields)
}

function search (data, fields, version, title) {
  var field
    , tail = fields
  while (!field && fields.length) field = tail.shift()
  fields = [field].concat(tail)
  var o
  if (!field && !tail.length) {
    o = {}
    o[version] = {}
    o[version][title] = data
    return o
  }
  var index = field.match(/(.+)\[([^\]]+)\]$/)
  if (index) {
    field = index[1]
    index = index[2]
    if (data.field && data.field.hasOwnProperty(index)) {
      return search(data[field][index], tail, version, title)
    } else {
      field = field + "[" + index + "]"
    }
  }
  if (Array.isArray(data)) {
    if (data.length === 1) {
      return search(data[0], fields, version, title)
    }
    var results = []
    data.forEach(function (data, i) {
      var tl = title.length
        , newt = title.substr(0, tl-(fields.join(".").length) - 1)
               + "["+i+"]" + [""].concat(fields).join(".")
      results.push(search(data, fields.slice(), version, newt))
    })
    results = results.reduce(reducer, {})
    return results
  }
  if (!data.hasOwnProperty(field)) {
    return
  }
  data = data[field]
  if (tail.length) {
    if (typeof data === "object") {
      // there are more fields to deal with.
      return search(data, tail, version, title)
    } else {
      return new Error("Not an object: "+data)
    }
  }
  o = {}
  o[version] = {}
  o[version][title] = data
  return o
}

function printData (data, name, npm, cb) {
  var versions = Object.keys(data)
    , msg = ""
    , showVersions = versions.length > 1
    , showFields

  versions.forEach(function (v) {
    var fields = Object.keys(data[v])
    showFields = showFields || (fields.length > 1)
    fields.forEach(function (f) {
      var d = cleanup(data[v][f])
      if (showVersions || showFields || typeof d !== "string") {
        d = cleanup(data[v][f])
        d = npm.config.get("json")
          ? JSON.stringify(d, null, 2)
          : util.inspect(d, false, 5, npm.color)
      } else if (typeof d === "string" && npm.config.get("json")) {
        d = JSON.stringify(d)
      }
      if (f && showFields) f += " = "
      if (d.indexOf("\n") !== -1) d = " \n" + d
      msg += (showVersions ? name + '@' + v + " " : "")
           + (showFields ? f : "") + d + "\n"
    })
  })

  console.log(msg)
  cb(null, data)
}

function cleanup (data) {
  if (Array.isArray(data)) {
    if (data.length === 1) {
      data = data[0]
    } else {
      return data.map(cleanup)
    }
  }
  if (!data || typeof data !== "object") return data

  if (typeof data.versions === "object"
      && data.versions
      && !Array.isArray(data.versions)) {
    data.versions = Object.keys(data.versions || {})
  }

  var keys = Object.keys(data)
  keys.forEach(function (d) {
    if (d.charAt(0) === "_") delete data[d]
    else if (typeof data[d] === "object") data[d] = cleanup(data[d])
  })
  keys = Object.keys(data)
  if (keys.length <= 3
      && data.name
      && (keys.length === 1
          || keys.length === 3 && data.email && data.url
          || keys.length === 2 && (data.email || data.url))) {
    data = unparsePerson(data)
  }
  return data
}

function unparsePerson (d) {
  if (typeof d === "string") return d
  return d.name
       + (d.email ? " <"+d.email+">" : "")
       + (d.url ? " ("+d.url+")" : "")
}
