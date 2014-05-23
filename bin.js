var search = require('./lib/search-and-analyze-readme');

search(process.argv.slice(2), console.log.bind(console));
