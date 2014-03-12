var Injector = require('di').Injector;

var modules = [
  require('./logger')
];

module.exports = new Injector(modules);
